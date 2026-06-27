using Microsoft.EntityFrameworkCore;
using projeto.Data;
using projeto.Data.Models;
using System.Text.Json;
using System.Text;

namespace projeto.Services
{
    public class RouteServices
    {
        private readonly AMoverContext _context;
        private readonly HttpClient _httpClient;

        public RouteServices(AMoverContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
        }

        public async Task<bool> OptimizeRouteForVehicleAsync(int vehicleId, DateTime date, List<int> taskIds, float? currentLat = null, float? currentLng = null)
        {
            var vehicle = await _context.vehicles.FindAsync(vehicleId);
            if (vehicle == null) throw new Exception("Vehicle not found");

            // Fetch tasks and their LocationNodes
            var tasks = await _context.tasks
                .Include(t => t.LocationNodeTasks)
                .ThenInclude(lnt => lnt.LocationNode)
                .Where(t => taskIds.Contains(t.ID))
                .ToListAsync();

            if (tasks.Count == 0) return false;

            var nodesForPython = new List<object>();
            
            // Depot (Mock logic: ID 0)
            if (currentLat.HasValue && currentLng.HasValue)
            {
                // Se a localização atual for fornecida, usamos essa localização como o ponto de partida (depot)
                nodesForPython.Add(new { id = 0, x = currentLat.Value, y = currentLng.Value, demand = 0 });
            }
            else
            {
                nodesForPython.Add(new { id = 0, x = 0, y = 0, demand = 0 });
            }

            foreach (var task in tasks)
            {
                var lnt = task.LocationNodeTasks?.FirstOrDefault();
                float x = 0;
                float y = 0;
                
                if (lnt?.LocationNode != null)
                {
                    x = lnt.LocationNode.latitude;
                    y = lnt.LocationNode.longintude;
                }
                else 
                {
                    // Mock coordinates if node doesn't exist yet
                    x = (float)(new Random().NextDouble() * 10);
                    y = (float)(new Random().NextDouble() * 10);
                    
                    // Create Node dynamically if it's missing (to satisfy the "use LocationNode for points")
                    var newNode = new LocationNode { 
                        latitude = x, 
                        longintude = y, 
                        address = task.street ?? "Sem morada",
                        status = "Pending"
                    };
                    _context.locationNodes.Add(newNode);
                    await _context.SaveChangesAsync();

                    var newLnt = new LocationNodeTask {
                        NodeID = newNode.ID,
                        TaskID = task.ID,
                        stopOrder = 0
                    };
                    _context.Add(newLnt);
                    await _context.SaveChangesAsync();
                }

                nodesForPython.Add(new { id = task.ID, x = x, y = y, demand = 1 }); 
            }

            var payload = new
            {
                nodes = nodesForPython,
                vehicles = new[] { new { capacity = vehicle.cargoCapacity, battery_kwh = vehicle.batteryCapacity } }
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            // Call python microservice
            var response = await _httpClient.PostAsync("http://amover-routes-optimizer:5000/optimize", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseBody);
            
            var orderedIds = result.GetProperty("route").EnumerateArray().Select(n => n.GetInt32()).ToList();
            
            // Rebuild Stop Order on LocationNodeTask
            int order = 1;
            string routeGroupId = Guid.NewGuid().ToString();

            foreach (var id in orderedIds)
            {
                if (id == 0) continue; // Skip depot
                
                var lnt = _context.Set<LocationNodeTask>().Include(x => x.Task).FirstOrDefault(x => x.TaskID == id);
                if (lnt != null)
                {
                    lnt.stopOrder = order;
                    lnt.RouteGroupId = routeGroupId;
                    
                    if (lnt.Task != null) 
                    {
                        lnt.Task.status = "Routed";
                    }
                    
                    order++;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> GetRouteForVehicle(int vehicleId, DateTime date)
        {
            var vehicle = await _context.vehicles.FindAsync(vehicleId);
            if (vehicle == null) return null;

            var tasks = await _context.tasks
                .Include(t => t.LocationNodeTasks)
                .Include(t => t.Nodes)
                .Where(t => t.vehicleID == vehicleId)
                .ToListAsync();

            // Match frontend logic for date fallback
            tasks = tasks.Where(t => (t.deadline ?? t.creationDate).Date == date.Date).ToList();

            if (tasks.Count == 0) return null;

            // Only consider tasks that have a LocationNodeTask with a RouteGroupId (meaning they are routed)
            var routedTasks = tasks.Where(t => t.LocationNodeTasks != null && t.LocationNodeTasks.Any(lnt => lnt.RouteGroupId != null)).ToList();

            if (routedTasks.Count == 0) return new List<object>();

            // Fetch driver names for all userIDs referenced in these tasks
            var userIds = routedTasks.Where(t => t.userID.HasValue).Select(t => t.userID!.Value).Distinct().ToList();
            var usersMap = await _context.users
                .Where(u => userIds.Contains(u.ID))
                .ToDictionaryAsync(u => u.ID, u => u.name);

            var routes = new List<object>();
            var groupedByRoute = routedTasks.GroupBy(t => t.LocationNodeTasks.First().RouteGroupId);

            foreach (var group in groupedByRoute)
            {
                var routePoints = group.Select(t => {
                    var lnt = t.LocationNodeTasks.First();
                    string? driverName = t.userID.HasValue && usersMap.ContainsKey(t.userID.Value)
                        ? usersMap[t.userID.Value]
                        : null;
                    return new {
                        id = t.ID,
                        stopOrder = lnt.stopOrder,
                        driverName = driverName,
                        task = new {
                            id = t.ID,
                            type = t.type,
                            description = t.description,
                            status = t.status,
                            priority = t.priority,
                            street = t.street,
                            door_number = t.door_number,
                            city = t.city,
                            userID = t.userID,
                            vehicleID = t.vehicleID,
                            deadline = t.deadline,
                            creationDate = t.creationDate,
                            user = driverName != null ? new { name = driverName } : null
                        }
                    };
                }).OrderBy(rp => rp.stopOrder).ToList();

                // Get driver name from the first task in this group
                var firstTask = group.FirstOrDefault();
                string? routeDriverName = firstTask?.userID.HasValue == true && usersMap.ContainsKey(firstTask.userID!.Value)
                    ? usersMap[firstTask.userID.Value]
                    : null;

                routes.Add(new {
                    id = group.Key,
                    vehicle_id = vehicleId,
                    route_date = date,
                    isOptimized = true,
                    driverName = routeDriverName,
                    routePoints = routePoints
                });
            }

            return routes;
        }


        public async Task<object> GetRouteForDriver(int userId, DateTime date)
        {
            var tasks = await _context.tasks
                .Include(t => t.vehicle) // Preciso de Include vehicle
                .Include(t => t.LocationNodeTasks)
                .Include(t => t.Nodes)
                .Where(t => t.userID == userId)
                .ToListAsync();

            // Match frontend logic for date fallback
            tasks = tasks.Where(t => (t.deadline ?? t.creationDate).Date == date.Date).ToList();

            if (tasks.Count == 0) return null;

            // Only consider tasks that have a LocationNodeTask with a RouteGroupId (meaning they are routed)
            var routedTasks = tasks.Where(t => t.LocationNodeTasks != null && t.LocationNodeTasks.Any(lnt => lnt.RouteGroupId != null)).ToList();

            if (routedTasks.Count == 0) return new List<object>();

            var routes = new List<object>();
            var groupedByRoute = routedTasks.GroupBy(t => t.LocationNodeTasks.First().RouteGroupId);

            foreach (var group in groupedByRoute)
            {
                var routePoints = group.Select(t => {
                    var lnt = t.LocationNodeTasks.First();
                    return new {
                        id = t.ID, // using task id as point id
                        stopOrder = lnt.stopOrder,
                        task = t
                    };
                }).OrderBy(rp => rp.stopOrder).ToList();

                var firstTask = group.FirstOrDefault();
                int? vehicleId = firstTask?.vehicleID;

                routes.Add(new {
                    id = group.Key,
                    vehicle_id = vehicleId ?? 1,
                    route_date = date,
                    isOptimized = true,
                    routePoints = routePoints
                });
            }

            return routes;
        }

        public async Task<object> GetRouteHistoryForDriver(int userId)
        {
            var tasks = await _context.tasks
                .Include(t => t.vehicle)
                .Include(t => t.LocationNodeTasks)
                .Include(t => t.Nodes)
                .Where(t => t.userID == userId)
                .ToListAsync();

            if (tasks.Count == 0) return new List<object>();

            var routedTasks = tasks.Where(t => t.LocationNodeTasks != null && t.LocationNodeTasks.Any(lnt => lnt.RouteGroupId != null)).ToList();
            if (routedTasks.Count == 0) return new List<object>();

            var routes = new List<object>();
            var groupedByRoute = routedTasks.GroupBy(t => t.LocationNodeTasks.First().RouteGroupId);

            foreach (var group in groupedByRoute)
            {
                // Verifica se TODAS as tasks deste grupo estão concluídas (completed, concluída, ou Finished)
                bool allCompleted = group.All(t => t.status != null && (t.status.Equals("completed", StringComparison.OrdinalIgnoreCase) || t.status.Equals("concluída", StringComparison.OrdinalIgnoreCase) || t.status.Equals("Finished", StringComparison.OrdinalIgnoreCase)));
                
                if (!allCompleted) continue; // Só mostra no histórico as que estiverem 100% concluídas

                var routePoints = group.Select(t => {
                    var lnt = t.LocationNodeTasks.First();
                    return new {
                        id = t.ID,
                        stopOrder = lnt.stopOrder,
                        task = t
                    };
                }).OrderBy(rp => rp.stopOrder).ToList();

                var firstTask = group.FirstOrDefault();
                int? vehicleId = firstTask?.vehicleID;
                var routeDate = firstTask?.deadline ?? firstTask?.creationDate ?? DateTime.Now;

                routes.Add(new {
                    id = group.Key,
                    vehicle_id = vehicleId ?? 1,
                    route_date = routeDate,
                    isOptimized = true,
                    routePoints = routePoints
                });
            }

            // Ordena as rotas mais recentes primeiro
            return routes.OrderByDescending(r => (DateTime)r.GetType().GetProperty("route_date").GetValue(r, null)).ToList();
        }

        public async System.Threading.Tasks.Task UpdateStopOrder(int taskId, int newOrder)
        {
            var lnt = await _context.Set<LocationNodeTask>().FirstOrDefaultAsync(x => x.TaskID == taskId);
            if (lnt != null)
            {
                lnt.stopOrder = newOrder;
                await _context.SaveChangesAsync();
            }
        }

        public async System.Threading.Tasks.Task<bool> CancelRouteGroupAsync(string routeGroupId, string reason, string comment, bool returnToUnassigned)
        {
            var lnts = await _context.Set<LocationNodeTask>()
                .Include(lnt => lnt.Task)
                .Where(lnt => lnt.RouteGroupId == routeGroupId)
                .ToListAsync();

            if (!lnts.Any()) return false;

            int vehicleId = lnts.First().Task.vehicleID ?? 0;
            var taskIds = string.Join(",", lnts.Select(l => l.TaskID));

            foreach (var lnt in lnts)
            {
                var task = lnt.Task;
                if (returnToUnassigned)
                {
                    task.status = "Unassigned";
                    task.vehicleID = null; // Lose motorcycle association
                }
                else
                {
                    task.status = "Cancelada";
                }

                // Remove LocationNodeTask map
                _context.Set<LocationNodeTask>().Remove(lnt);

                // Option: could remove the LocationNode if it's no longer used
                var node = await _context.Set<LocationNode>().FindAsync(lnt.NodeID);
                if (node != null)
                {
                    _context.Set<LocationNode>().Remove(node);
                }
            }

            var log = new CanceledRouteLog
            {
                RouteGroupId = routeGroupId,
                VehicleID = vehicleId,
                Reason = reason,
                Comment = comment,
                ReturnedToUnassigned = returnToUnassigned,
                TaskIds = taskIds
            };
            _context.Set<CanceledRouteLog>().Add(log);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> FinishRouteGroupAsync(string routeGroupId)
        {
            var lnts = await _context.Set<LocationNodeTask>()
                .Include(lnt => lnt.Task)
                .Where(lnt => lnt.RouteGroupId == routeGroupId)
                .ToListAsync();

            if (!lnts.Any()) return false;

            foreach (var lnt in lnts)
            {
                lnt.Task.status = "Finished";
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
