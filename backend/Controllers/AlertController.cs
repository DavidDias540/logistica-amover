using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using projeto.Data.Models;
using projeto.Services;

namespace projeto.Controllers
{
    [Authorize(Roles = "admin,motorista")]
    [ApiController]
    [Route("[controller]")]
    public class AlertController : ControllerBase
    {
        private readonly AlertServices _db;
        private readonly ILogger<AlertController> _logger;

        public AlertController(ILogger<AlertController> logger, AlertServices db)
        {
            _logger = logger;
            _db = db;
        }

        [HttpPost(Name = "PostAlert")]
        public void Post([FromBody] AlertDTO _a) //_ID_users is a string with the ids of the users separated by commas
        {
            try
            {
                Alert a = new Alert
                {
                    description = _a.description,
                    adminID = _a.adminID
                };
                _db.CreateAlert(a, _a.targets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar alerta.");
                throw new Exception(ex.Message);
            }
            return;
        }

        [HttpGet(Name = "GetAlerts")]
        public IEnumerable<Alert> Get()
        {
            try
            {
                List<Alert> reply = _db.GetAlerts();
                return reply;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching alerts");
                throw new Exception("Error fetching alerts", ex);
            }
        }

        [HttpGet("{id}", Name = "GetAlert")]
        public Alert Get(int id)
        {
            try
            {
                Alert reply = _db.GetAlertByID(id);
                return reply;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching alert with ID {id}", id);
                throw new Exception($"Error fetching alert with ID {id}", ex);
            }
        }

        [HttpDelete("{id}", Name = "DeleteAlert")]
        public void Delete(int id)
        {
            _db.DeleteAlert(id);
            return;
        }
    }

    public class AlertDTO
    {
        public string description { get; set; }
        public int adminID { get; set; } // User n - 1
        public List<int> targets { get; set; } // List of User IDs
    }
}
