using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using projeto.Data.Models;

namespace projeto.Controllers
{
    [Authorize(Roles = "admin")]
    [ApiController]
    [Route("[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ILogger<ReportController> _logger;
        private readonly DatabaseOperations db;

        public ReportController(ILogger<ReportController> logger, DatabaseOperations _db)
        {
            _logger = logger;
            db = _db;
        }

        [HttpPost(Name = "PostReport")]
        public void Post(string description)
        {

            db.CreateReport(description);
            return;
        }

        [HttpGet(Name = "GetReports")]
        public IEnumerable<PerformanceReport> Get()
        {
            List<PerformanceReport> reply = db.GetReports();
            return reply;
        }

        /*
        [HttpGet("{id}", Name = "GetReport")]
        public PerformanceReport Get(int id)
        {
            PerformanceReport reply = DatabaseOperations.GetReport(id);
            return reply;
        }

        [HttpDelete("{id}", Name = "DeleteReport")]
        public void Delete(int id)
        {
            DatabaseOperations.DeleteReport(id);
            return;
        }
        */
    }
}

