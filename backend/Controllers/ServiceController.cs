using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using projeto.Data;
using projeto.Data.Models;
using System.Collections.Generic;
using System.Linq;

namespace projeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceController : ControllerBase
    {
        private readonly AMoverContext _db;
        private readonly ILogger<ServiceController> _logger;

        public ServiceController(ILogger<ServiceController> logger, AMoverContext db)
        {
            _logger = logger;
            _db = db;
        }

        [HttpPost]
        public IActionResult Post([FromBody] Service service)
        {
            _db.services.Add(service);
            _db.SaveChanges();
            return Ok(service);
        }

        [HttpGet]
        public IEnumerable<Service> Get()
        {
            return _db.services.ToList();
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var service = _db.services.FirstOrDefault(s => s.ID == id);
            if (service == null) return NotFound();
            return Ok(service);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Service service)
        {
            var existing = _db.services.FirstOrDefault(s => s.ID == id);
            if (existing == null) return NotFound();
            
            existing.description = service.description;
            existing.category = service.category;
            existing.companyID = service.companyID;
            
            _db.SaveChanges();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var existing = _db.services.FirstOrDefault(s => s.ID == id);
            if (existing == null) return NotFound();
            
            _db.services.Remove(existing);
            _db.SaveChanges();
            return Ok();
        }
    }
}
