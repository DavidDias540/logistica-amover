using Microsoft.EntityFrameworkCore;
using projeto.Data;
using projeto.Data.Models;
using Task = projeto.Data.Models.Task;

namespace projeto.Services
{
    public class TaskServices
    {
        private readonly AMoverContext _context;

        public TaskServices(AMoverContext context)
        {
            _context = context;
        }

        public void CreateTask(Task t, int sID, int cID)
        {
            try
            {
                t.creationDate = DateTime.Now;
                var service = _context.services.Find(sID);
                if (service == null)
                    throw new Exception("Serviço não encontrado.");

                t.service = service;

                var client = _context.clients.Find(cID);
                if (client == null)
                    throw new Exception("Cliente não encontrado.");

                t.client = client;

                _context.tasks.Add(t);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao criar tarefa: " + ex.Message);
            }
        }

        public bool EditTask(Task t)
        {
            try
            {
                var target = _context.tasks.Find(t.ID);
                if (target == null) return false;

                if (target.vehicleID != t.vehicleID)
                {
                    target.vehicleID = t.vehicleID;
                    if (t.vehicleID.HasValue)
                    {
                        var vehicle = _context.vehicles.FirstOrDefault(v => v.ID == t.vehicleID.Value);
                        if (vehicle != null && vehicle.ownerID.HasValue)
                        {
                            target.userID = vehicle.ownerID;
                        }
                    }
                }

                target.status = t.status;
                target.type = t.type;
                target.description = t.description;
                target.street = t.street;
                target.door_number = t.door_number;
                target.floor = t.floor;
                target.postal_code = t.postal_code;
                target.city = t.city;
                target.instructions = t.instructions;
                target.notes = t.notes;
                target.priority = t.priority;

                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao editar tarefa: " + ex.Message);
            }
        }

        public List<Task> GetTasks()
        {
            try
            {
                var list = _context.tasks
                    .Include(t => t.service)
                    .Include(t => t.client)
                    .ToList();

                return list ?? new List<Task>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro na BD: {ex.Message}");
                throw;
            }
        }

        public List<Task> GetTasksByDriver(int driverId)
        {
            try
            {
                var list = _context.tasks
                    .Include(t => t.vehicle)
                    .Include(t => t.Nodes)
                    .Where(t => t.userID == driverId)
                    .ToList();

                return list ?? new List<Task>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro na BD: {ex.Message}");
                throw;
            }
        }

        public Task? GetTaskByID(int id)
        {
            try
            {
                return _context.tasks
                    .Include(t => t.user)
                    .Include(t => t.vehicle)
                    .Include(t => t.service)
                    .Include(t => t.client)
                    .Include(t => t.Nodes)
                    .Include(t => t.plan)
                    .FirstOrDefault(t => t.ID == id);
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao procurar tarefa: " + ex.Message);
            }
        }

        public bool DeleteTask(int id)
        {
            try
            {
                var target = _context.tasks.Find(id);
                if (target == null) return false;

                _context.tasks.Remove(target);
                return _context.SaveChanges() > 0;
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao eliminar tarefa: " + ex.Message);
            }
        }

        public bool AddTaskNode(int taskID, int nodeID)
        {
            var task = _context.tasks.Include(t => t.Nodes).FirstOrDefault(t => t.ID == taskID);
            var node = _context.locationNodes.Find(nodeID);

            if (task == null || node == null) return false;

            task.Nodes ??= new List<LocationNode>();
            if (!task.Nodes.Any(n => n.ID == nodeID))
            {
                task.Nodes.Add(node);
                return _context.SaveChanges() > 0;
            }
            return true;
        }

        public bool RemoveTaskNode(int taskID, int nodeID)
        {
            var task = _context.tasks.Include(t => t.Nodes).FirstOrDefault(t => t.ID == taskID);
            if (task == null || task.Nodes == null) return false;

            var node = task.Nodes.FirstOrDefault(n => n.ID == nodeID);
            if (node == null) return false;

            task.Nodes.Remove(node);
            return _context.SaveChanges() > 0;
        }

        public bool UpdateNodeStatus(int taskID, int nodeID, string status)
        {
            var task = _context.tasks.Include(t => t.Nodes).FirstOrDefault(t => t.ID == taskID);
            if (task == null) return false;

            task.status = status;

            if (task.Nodes != null)
            {
                var node = task.Nodes.FirstOrDefault(n => n.ID == nodeID);
                if (node != null)
                {
                    node.status = status;
                }
            }
            
            return _context.SaveChanges() > 0;
        }
    }
}