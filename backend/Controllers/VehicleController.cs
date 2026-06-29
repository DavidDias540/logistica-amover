using System.Net.NetworkInformation;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projeto.Data.Models;
using projeto.Services;

namespace projeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehicleController : ControllerBase
    {
        private readonly VehicleServices _db;
        private readonly UserServices _userDb;
        private readonly ILogger<VehicleController> _logger;
        private readonly projeto.Data.AMoverContext _context;

        public VehicleController(ILogger<VehicleController> logger, VehicleServices db, UserServices userDb, projeto.Data.AMoverContext context)
        {
            _logger = logger;
            _db = db;
            _userDb = userDb;
            _context = context;
        }

        private User? GetCurrentUser()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value
                ?? User.FindFirst("email")?.Value
                ?? User.FindFirst("preferred_username")?.Value
                ?? User?.Identity?.Name;
            if (string.IsNullOrEmpty(email)) return null;
            return _userDb.GetUserByEmail(email);
        }

        private bool IsAdmin(User u) => u.role?.ToLower() == "admin";
        private bool IsManager(User u) => u.role?.ToLower() == "manager";
        private bool IsManagerScopedVehicle(User currentUser, int? vehicleCompanyId) =>
            IsManager(currentUser) && currentUser.companyID == vehicleCompanyId;



        [Authorize]
        [HttpPost]
        public IActionResult Post([FromBody] VehicleDTO _v)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                int? effectiveCompanyId = _v.companyID;
                if (IsManager(currentUser))
                {
                    effectiveCompanyId = currentUser.companyID;
                }

                Vehicle v = new Vehicle
                {
                    VID = _v.VID,
                    name = _v.name,
                    brand = _v.brand,
                    model = _v.model,
                    status = _v.status,
                    batteryCapacity = _v.batteryCapacity,
                    cargoCapacity = _v.cargoCapacity,
                    ownerID = _v.ownerID,
                    companyID = effectiveCompanyId
                };
                _db.CreateVehicle(v);
                return Ok(v);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar veículo.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }


        [HttpGet]
        public ActionResult<IEnumerable<Vehicle>> Get()
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                List<Vehicle> targets = _db.GetVehicles();
                if (IsManager(currentUser))
                {
                    targets = targets.Where(v => v.companyID == currentUser.companyID).ToList();
                }

                if (targets == null || targets.Count == 0)
                {
                    return NotFound("Nenhum veículo encontrado.");
                }
                return Ok(targets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter veículos.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }


        [HttpGet("{VID}")]
        public ActionResult<Vehicle> Get(int VID)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                var target = _db.GetVehicleByID(VID.ToString());
                if (target == null) return NotFound("Nenhum veículo encontrado com o VID expecificado");

                if (IsManager(currentUser) && target.companyID != currentUser.companyID)
                {
                    return Forbid("Não pode aceder a veículos de outra empresa.");
                }

                return Ok(target);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter veículo com VID {VID}", VID);
                return StatusCode(500, "Erro interno do servidor.");
            }
        }


        [Authorize]
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] VehicleDTO vehicle)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                var existing = _context.vehicles.FirstOrDefault(v => v.ID == id);
                if (existing == null) return NotFound("Veículo não encontrado.");

                if (IsManager(currentUser) && existing.companyID != currentUser.companyID)
                {
                    return Forbid("Não pode editar veículos de outra empresa.");
                }

                int? effectiveCompanyId = vehicle.companyID;
                if (IsManager(currentUser))
                {
                    effectiveCompanyId = currentUser.companyID;
                }

                if (vehicle.ownerID.HasValue && effectiveCompanyId == null)
                {
                    return BadRequest("Não pode atribuir condutor a uma mota sem empresa.");
                }

                existing.VID = vehicle.VID;
                existing.name = vehicle.name;
                existing.brand = vehicle.brand;
                existing.model = vehicle.model;
                existing.status = vehicle.status;
                existing.batteryCapacity = vehicle.batteryCapacity;
                existing.cargoCapacity = vehicle.cargoCapacity;
                existing.ownerID = vehicle.ownerID;
                existing.companyID = effectiveCompanyId;
                
                return _db.EditVehicle(existing) ? Ok(new { message = "Veículo atualizado com sucesso." }) : NotFound("Veículo não encontrado.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar veículo com ID {id}", id);
                return StatusCode(500, "Erro interno do servidor.");
            }
        }


        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                var vehicle = _context.vehicles.FirstOrDefault(v => v.ID == id);
                if (vehicle == null) return NotFound("Veículo não encontrado.");

                if (IsManager(currentUser) && vehicle.companyID != currentUser.companyID)
                {
                    return Forbid("Não pode eliminar veículos de outra empresa.");
                }

                return _db.DeleteVehicle(id) ? Ok(new { message = "Veículo eliminado com sucesso." }) : NotFound("Veículo não encontrado.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao eliminar veículo com ID {id}", id);
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [Authorize]
        [HttpPatch("{id}/status")]
        public IActionResult PatchStatus(int id, [FromBody] VehicleStatusDTO dto)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

            var vehicle = _context.vehicles.FirstOrDefault(v => v.ID == id);
            if (vehicle == null) return NotFound("Veículo não encontrado.");

            if (IsManager(currentUser) && vehicle.companyID != currentUser.companyID)
            {
                return Forbid("Não pode alterar veículos de outra empresa.");
            }
            
            vehicle.status = dto.status;
            _context.SaveChanges();
            return Ok(new { message = "Status atualizado com sucesso." });
        }

        [Authorize]
        [HttpPatch("{id}/owner")]
        public IActionResult PatchOwner(int id, [FromBody] VehicleOwnerDTO dto)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

            var vehicle = _context.vehicles.FirstOrDefault(v => v.ID == id);
            if (vehicle == null) return NotFound("Veículo não encontrado.");

            if (IsManager(currentUser) && vehicle.companyID != currentUser.companyID)
            {
                return Forbid("Não pode alterar veículos de outra empresa.");
            }

            if (dto.ownerID.HasValue && vehicle.companyID == null)
            {
                return BadRequest("Não pode atribuir condutor a uma mota sem empresa.");
            }
            
            // If the owner is changing (e.g., removing the driver or assigning a new one)
            if (vehicle.ownerID != dto.ownerID)
            {
                // Find all tasks assigned to this vehicle that are not finished
                var pendingTasks = _context.tasks
                    .Include(t => t.LocationNodeTasks)
                    .Where(t => t.vehicleID == id && 
                                t.status != "Finished" && 
                                t.status != "completed" && 
                                t.status != "concluída" && 
                                t.status != "Cancelada")
                    .ToList();

                foreach (var task in pendingTasks)
                {
                    // Return task to the assignment pool
                    task.status = "Unassigned";
                    task.vehicleID = null;

                    // Remove from the route (delete LocationNodeTask entries)
                    if (task.LocationNodeTasks != null)
                    {
                        var lnts = task.LocationNodeTasks.ToList();
                        foreach (var lnt in lnts)
                        {
                            _context.Set<LocationNodeTask>().Remove(lnt);
                            
                            // Optional: Remove the associated LocationNode as well if it's not used elsewhere
                            var node = _context.Set<LocationNode>().FirstOrDefault(n => n.ID == lnt.NodeID);
                            if (node != null) 
                            {
                                _context.Set<LocationNode>().Remove(node);
                            }
                        }
                    }
                }
            }

            vehicle.ownerID = dto.ownerID;
            _context.SaveChanges();
            
            return Ok(new { message = "Condutor atualizado com sucesso.", vehicle = vehicle });
        }

        [Authorize]
        [HttpGet("maintenance")]
        public IActionResult GetMaintenance([FromQuery] bool? resolved)
        {
            var query = _context.maintenances.AsQueryable();
            if (resolved.HasValue)
            {
                query = query.Where(m => m.resolved == resolved.Value);
            }
            return Ok(query.ToList());
        }

        [Authorize]
        [HttpPost("maintenance")]
        public IActionResult PostMaintenance([FromBody] Maintenance m)
        {
            _context.maintenances.Add(m);
            _context.SaveChanges();
            return Ok(m);
        }

        [Authorize]
        [HttpPut("maintenance/resolve/{id}")]
        public IActionResult ResolveMaintenance(int id, [FromBody] MaintenanceResolveDTO dto)
        {
            var m = _context.maintenances.FirstOrDefault(x => x.ID == id);
            if (m == null) return NotFound();
            m.resolved = dto.resolved;
            _context.SaveChanges();
            return Ok(m);
        }
    }

    public class VehicleDTO
    {
        public string VID { get; set; } = ""; 
        public string name { get; set; } = "";
        public string brand { get; set; } = "";
        public string model { get; set; } = "";
        public string status { get; set; } = "Disponível";
        public float batteryCapacity { get; set; } = 0;
        public float cargoCapacity { get; set; } = 0;
        public int? ownerID { get; set; }
        public int? companyID { get; set; }
    }

    public class VehicleStatusDTO
    {
        public string status { get; set; } = "Disponível";
    }

    public class MaintenanceResolveDTO
    {
        public bool resolved { get; set; }
    }

    public class VehicleOwnerDTO
    {
        public int? ownerID { get; set; }
    }
}
