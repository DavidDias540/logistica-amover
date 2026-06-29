using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using projeto.Data;
using projeto.Data.Models;
using projeto.Services;
using Task = projeto.Data.Models.Task;

namespace projeto.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly TaskServices _db;
        private readonly UserServices _userDb;
        private readonly AMoverContext _context;
        private readonly ILogger<TaskController> _logger;

        public TaskController(ILogger<TaskController> logger, TaskServices db, UserServices userDb, AMoverContext context)
        {
            _logger = logger;
            _db = db;
            _userDb = userDb;
            _context = context;
        }

        private User? GetCurrentUser()
        {
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                ?? User.FindFirst("email")?.Value
                ?? User.FindFirst("preferred_username")?.Value
                ?? User?.Identity?.Name;
            if (string.IsNullOrEmpty(email)) return null;
            return _userDb.GetUserByEmail(email);
        }

        private bool IsAdmin(User u) => u.role?.ToLower() == "admin";
        private bool IsManager(User u) => u.role?.ToLower() == "manager";
        private bool BelongsToManagerCompany(User u, Task t) => t.service?.companyID == u.companyID;

        [HttpPost]
        public IActionResult Post([FromBody] TaskDTO _t)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                if (IsManager(currentUser) && _t.ServiceID.HasValue)
                {
                    var service = _context.services.Find(_t.ServiceID.Value);
                    if (service == null || service.companyID != currentUser.companyID)
                    {
                        return Forbid("Não pode criar tarefas para serviços de outra empresa.");
                    }
                }

                Task t = new Task
                {
                    type = _t.Type ?? "Nova Tarefa",
                    description = _t.Description ?? "Sem descrição",
                    serviceID = _t.ServiceID,
                    clientID = _t.ClientID,
                    status = "Unassigned",
                    creationDate = DateTime.UtcNow,
                    deadline = _t.deadline,
                    availableTimeStart = _t.availableTimeStart,
                    availableTimeEnds = _t.availableTimeEnds,
                    street = _t.street,
                    door_number = _t.door_number,
                    floor = _t.floor,
                    postal_code = _t.postal_code,
                    city = _t.city,
                    instructions = _t.instructions,
                    notes = _t.notes,
                    priority = _t.priority
                };
                
                // If the frontend does not send the TimeSpans correctly, just leave them out for now
                // since the payload from the frontend currently sends DateTime strings for them, 
                // we should probably not map them directly if they crash. Wait! 
                // Actually the frontend doesn't send availableTimeStart in handleAddTask! So it's fine.

                _db.CreateTask(t, _t.ServiceID ?? 0, _t.ClientID);
                return Ok(t);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro a criar tarefa.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpGet]
        public ActionResult<IEnumerable<Task>> Get()
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                List<Task> targets = _db.GetTasks();
                if (IsManager(currentUser))
                {
                    targets = targets
                        .Where(t => t.service != null && t.service.companyID == currentUser.companyID)
                        .ToList();
                }

                if (targets == null || targets.Count == 0)
                {
                    return NotFound("Nenhuma tarefa encontrada.");
                }
                return Ok(targets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter tarefas.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [HttpGet("driver/{userId}")]
        public ActionResult<IEnumerable<Task>> GetByDriver(int userId)
        {
            try
            {
                List<Task> targets = _db.GetTasksByDriver(userId);
                if (targets == null || targets.Count == 0)
                {
                    return NotFound("Nenhuma tarefa encontrada para este motorista.");
                }
                return Ok(targets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter tarefas do motorista {UserId}.", userId);
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Task> Get(int id)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                var target = _db.GetTaskByID(id);
                if (target == null) return NotFound("Nenhuma tarefa encontrada com o ID especificado");

                if (IsManager(currentUser) && !BelongsToManagerCompany(currentUser, target))
                {
                    return Forbid("Não pode aceder a tarefas de outra empresa.");
                }

                return Ok(target);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter tarefa com ID {ID}", id);
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Task task)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                var existing = _db.GetTaskByID(id);
                if (existing == null) return NotFound("Tarefa não encontrada.");

                if (IsManager(currentUser) && !BelongsToManagerCompany(currentUser, existing))
                {
                    return Forbid("Não pode editar tarefas de outra empresa.");
                }

                task.ID = id;
                return _db.EditTask(task) ? Ok(new { message = "Tarefa atualizada com sucesso." }) : NotFound("Tarefa não encontrada.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar tarefa.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

                var existing = _db.GetTaskByID(id);
                if (existing == null) return NotFound("Tarefa não encontrada.");

                if (IsManager(currentUser) && !BelongsToManagerCompany(currentUser, existing))
                {
                    return Forbid("Não pode eliminar tarefas de outra empresa.");
                }

                return _db.DeleteTask(id) ? Ok(new { message = "Tarefa eliminada com sucesso." }) : NotFound("Tarefa não encontrada.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao eliminar tarefa com ID {id}", id);
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [HttpPost("{id}/node/{nodeID}")]
        public IActionResult SetNode(int id, int nodeID)
        {
            try
            {
                return _db.AddTaskNode(id, nodeID) ? Ok(new { message = "Nó adicionado com sucesso." }) : NotFound("Tarefa ou nó não encontrado.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao adicionar nó.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpDelete("{id}/node/{nodeID}")]
        public IActionResult RemoveNode(int id, int nodeID)
        {
            try
            {
                return _db.RemoveTaskNode(id, nodeID) ? Ok(new { message = "Nó removido com sucesso." }) : NotFound("Tarefa ou nó não encontrado.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao remover nó.");
                return StatusCode(500, "Erro interno.");
            }
        }

        [HttpPatch("{id}/node/{nodeID}/status")]
        public IActionResult UpdateNodeStatus(int id, int nodeID, [FromBody] UpdateStatusRequest req)
        {
            try
            {
                return _db.UpdateNodeStatus(id, nodeID, req.Status) ? Ok(new { message = "Estado do nó atualizado com sucesso." }) : NotFound("Tarefa ou nó não encontrado.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar estado do nó.");
                return StatusCode(500, "Erro interno.");
            }
        }

        public class UpdateStatusRequest
        {
            public string Status { get; set; } = "Completed";
        }

        public class TaskDTO
        {
            public string? Type { get; set; } = "Nova Tarefa";
            public string? Description { get; set; } = "Sem descrição";
            public int? ServiceID { get; set; }
            public int ClientID { get; set; }
            
            public DateTime? deadline { get; set; }
            public TimeSpan? availableTimeStart { get; set; }
            public TimeSpan? availableTimeEnds { get; set; }
            public string? street { get; set; }
            public string? door_number { get; set; }
            public string? floor { get; set; }
            public string? postal_code { get; set; }
            public string? city { get; set; }
            public string? instructions { get; set; }
            public string? notes { get; set; }
            public string? priority { get; set; }
        }
    }
}