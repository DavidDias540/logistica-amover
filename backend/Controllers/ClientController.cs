using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using projeto.Data.Models;
using projeto.Services;

namespace projeto.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly ClientServices _db;
        private readonly UserServices _userDb;

        public ClientController(ClientServices db, UserServices userDb)
        {
            _db = db;
            _userDb = userDb;
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

        [HttpGet]
        public ActionResult<IEnumerable<Client>> Get()
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

            var targets = _db.GetClients();
            if (IsManager(currentUser))
            {
                targets = targets.Where(c => c.companyID == currentUser.companyID).ToList();
            }
            return Ok(targets);
        }

        [HttpGet("{id}")]
        public ActionResult<Client> Get(int id)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

            var target = _db.GetClientByID(id);
            if (target == null) return NotFound();
            if (IsManager(currentUser) && target.companyID != currentUser.companyID)
                return Forbid("Não pode aceder a clientes de outra empresa.");
            return Ok(target);
        }

        [HttpPost]
        public IActionResult Post([FromBody] Client c)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

            if (IsManager(currentUser))
            {
                c.companyID = currentUser.companyID;
            }

            _db.CreateClient(c);
            return Ok(c);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Client c)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

            var existing = _db.GetClientByID(id);
            if (existing == null) return NotFound();

            if (IsManager(currentUser) && existing.companyID != currentUser.companyID)
                return Forbid("Não pode editar clientes de outra empresa.");

            if (IsManager(currentUser))
            {
                c.companyID = currentUser.companyID;
            }

            c.ID = id;
            if (_db.EditClient(c))
                return Ok(c);
            return NotFound();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador autenticado não encontrado.");

            var target = _db.GetClientByID(id);
            if (target == null) return NotFound();

            if (IsManager(currentUser) && target.companyID != currentUser.companyID)
                return Forbid("Não pode eliminar clientes de outra empresa.");

            if (_db.DeleteClient(id))
                return Ok();
            return NotFound();
        }
    }
}
