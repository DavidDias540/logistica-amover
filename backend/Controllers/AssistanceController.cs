using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projeto.Data;
using projeto.Data.Models;

namespace projeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistanceController : ControllerBase
    {
        private readonly AMoverContext _context;
        private readonly ILogger<AssistanceController> _logger;

        public AssistanceController(ILogger<AssistanceController> logger, AMoverContext context)
        {
            _logger = logger;
            _context = context;
        }

        private User? GetCurrentUser()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value
                ?? User.FindFirst("email")?.Value
                ?? User.FindFirst("preferred_username")?.Value
                ?? User?.Identity?.Name;
            if (string.IsNullOrEmpty(email)) return null;
            return _context.users.FirstOrDefault(u => u.email == email);
        }

        private bool IsAdminOrManager(User u) => u.role?.ToLower() == "admin" || u.role?.ToLower() == "manager";

        [Authorize]
        [HttpGet]
        public IActionResult Get()
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador não encontrado.");

            IQueryable<AssistanceRequest> query = _context.assistanceRequests
                .Include(r => r.Messages)
                .Include(r => r.TargetUser)
                .OrderByDescending(r => r.date);

            if (!IsAdminOrManager(currentUser))
            {
                // Motorista: apenas pedidos gerais (sem destinatário) ou dirigidos a si
                query = query.Where(r => r.TargetUserID == null || r.TargetUserID == currentUser.ID);
            }

            return Ok(query.ToList());
        }

        [Authorize]
        [HttpPost]
        public IActionResult Post([FromBody] AssistanceRequest request)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador não encontrado.");
            if (!IsAdminOrManager(currentUser)) return Forbid("Apenas admin/manager podem criar alertas.");

            request.date = DateTime.UtcNow;
            if (request.Messages != null && request.Messages.Any())
            {
                foreach (var msg in request.Messages)
                {
                    msg.timestamp = DateTime.UtcNow;
                    msg.sender = $"{currentUser.name} ({currentUser.role})";
                }
            }

            _context.assistanceRequests.Add(request);
            _context.SaveChanges();
            return Ok(request);
        }

        [Authorize]
        [HttpPost("{id}/messages")]
        public IActionResult PostMessage(int id, [FromBody] AssistanceMessageCreateDto dto)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador não encontrado.");

            var request = _context.assistanceRequests
                .Include(r => r.TargetUser)
                .FirstOrDefault(r => r.ID == id);
            if (request == null) return NotFound("Request não encontrado.");

            if (!IsAdminOrManager(currentUser))
            {
                // Motorista só pode responder aos seus próprios pedidos ou pedidos gerais
                if (request.TargetUserID != null && request.TargetUserID != currentUser.ID)
                    return Forbid("Não tem permissão para responder a este pedido.");
            }

            if (string.IsNullOrWhiteSpace(dto.text))
                return BadRequest("Texto da mensagem é obrigatório.");

            var message = new AssistanceMessage
            {
                AssistanceRequestID = id,
                text = dto.text,
                timestamp = DateTime.UtcNow,
                sender = $"{currentUser.name} ({currentUser.role})"
            };

            _context.assistanceMessages.Add(message);
            _context.SaveChanges();
            
            return Ok(message);
        }

        [Authorize]
        [HttpPut("{id}/close")]
        public IActionResult CloseChat(int id)
        {
            var currentUser = GetCurrentUser();
            if (currentUser == null) return Unauthorized("Utilizador não encontrado.");

            if (!IsAdminOrManager(currentUser))
                return Forbid("Apenas admin/manager podem fechar conversas.");

            var request = _context.assistanceRequests.FirstOrDefault(r => r.ID == id);
            if (request == null) return NotFound("Request não encontrado.");

            request.status = "Closed";
            _context.SaveChanges();

            return Ok(request);
        }
    }

    public class AssistanceMessageCreateDto
    {
        public string text { get; set; } = string.Empty;
        public string? sender { get; set; }
    }
}
