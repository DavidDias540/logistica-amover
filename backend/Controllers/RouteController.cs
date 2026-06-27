using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using projeto.Data;
using projeto.Data.Models;
using projeto.Services;

namespace projeto.Controllers
{
    // [Authorize(Roles = "admin,motorista")]
    [ApiController]
    [Route("api/[controller]")]
    public class RouteController : ControllerBase
    {
        private readonly RouteServices _routeServices;
        private readonly ILogger<RouteController> _logger;

        public RouteController(ILogger<RouteController> logger, RouteServices routeServices)
        {
            _logger = logger;
            _routeServices = routeServices;
        }

        [HttpGet(Name = "GetRoute")]
        public async Task<IActionResult> Get([FromQuery] int vehicleId, [FromQuery] DateTime date)
        {
            try
            {
                var route = await _routeServices.GetRouteForVehicle(vehicleId, date);
                if (route == null) return Ok(new { }); // Return empty for frontend compatibility
                return Ok(route);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving route");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("driver/{userId}", Name = "GetRouteForDriver")]
        public async Task<IActionResult> GetForDriver(int userId, [FromQuery] DateTime date)
        {
            try
            {
                var route = await _routeServices.GetRouteForDriver(userId, date);
                if (route == null) return Ok(new List<object>()); // Return empty array for Android compatibility
                return Ok(route);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving route for driver");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("driver/{userId}/history", Name = "GetRouteHistoryForDriver")]
        public async Task<IActionResult> GetHistoryForDriver(int userId)
        {
            try
            {
                var route = await _routeServices.GetRouteHistoryForDriver(userId);
                if (route == null) return Ok(new List<object>()); 
                return Ok(route);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving route history for driver");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("optimize-for-vehicle", Name = "OptimizeRouteForVehicle")]
        public async Task<IActionResult> OptimizeRouteForVehicle([FromBody] OptimizeRequestDto request)
        {
            try
            {
                var success = await _routeServices.OptimizeRouteForVehicleAsync(request.VehicleId, request.Date, request.TaskIds);
                if (!success) return BadRequest("Nenhuma tarefa encontrada ou inválida.");
                
                return Ok(new { message = "Rota optimizada com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error optimizing route for vehicle");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("reoptimize-live", Name = "ReoptimizeLive")]
        public async Task<IActionResult> ReoptimizeLive([FromBody] ReoptimizeLiveRequestDto request)
        {
            try
            {
                var success = await _routeServices.OptimizeRouteForVehicleAsync(request.VehicleId, request.Date, request.TaskIds, request.CurrentLat, request.CurrentLng);
                if (!success) return BadRequest("Nenhuma tarefa encontrada ou falha na reotimização.");
                
                return Ok(new { message = "Rota re-optimizada com sucesso baseada na localização atual" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reoptimizing live route");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("node/{taskId}")]
        public async Task<IActionResult> UpdateNodeOrder(int taskId, [FromBody] UpdateOrderDto dto)
        {
            try
            {
                await _routeServices.UpdateStopOrder(taskId, dto.StopOrder);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stop order");
                return StatusCode(500, ex.Message);
            }
        }

        public class CancelRouteDto
        {
            public string Reason { get; set; }
            public string Comment { get; set; }
            public bool ReturnToUnassigned { get; set; }
        }

        [HttpPost("group/{routeGroupId}/cancel", Name = "CancelRouteGroup")]
        public async Task<IActionResult> CancelRouteGroup(string routeGroupId, [FromBody] CancelRouteDto dto)
        {
            try
            {
                var success = await _routeServices.CancelRouteGroupAsync(routeGroupId, dto.Reason, dto.Comment, dto.ReturnToUnassigned);
                if (!success) return BadRequest("Rota não encontrada ou já cancelada.");
                
                return Ok(new { message = "Rota cancelada com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error canceling route");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("group/{routeGroupId}/finish", Name = "FinishRouteGroup")]
        public async Task<IActionResult> FinishRouteGroup(string routeGroupId)
        {
            try
            {
                var success = await _routeServices.FinishRouteGroupAsync(routeGroupId);
                if (!success) return BadRequest("Rota não encontrada.");
                
                return Ok(new { message = "Rota terminada com sucesso" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finishing route");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("cancelations", Name = "GetCancelations")]
        public async Task<IActionResult> GetCancelations([FromServices] AMoverContext context)
        {
            try
            {
                var logs = await context.Set<CanceledRouteLog>()
                    .OrderByDescending(c => c.CancelationDate)
                    .ToListAsync();
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching cancelation logs");
                return StatusCode(500, ex.Message);
            }
        }
    }

    public class UpdateOrderDto
    {
        public int StopOrder { get; set; }
    }

    public class OptimizeRequestDto
    {
        public int VehicleId { get; set; }
        public DateTime Date { get; set; }
        public List<int> TaskIds { get; set; }
    }

    public class ReoptimizeLiveRequestDto
    {
        public int VehicleId { get; set; }
        public DateTime Date { get; set; }
        public List<int> TaskIds { get; set; }
        public float CurrentLat { get; set; }
        public float CurrentLng { get; set; }
    }
}
