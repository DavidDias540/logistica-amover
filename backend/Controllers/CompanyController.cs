using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using projeto.Data.Models;
using projeto.Services;

namespace projeto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly CompanyServices _db;
        private readonly ILogger<CompanyController> _logger;

        public CompanyController(ILogger<CompanyController> logger, CompanyServices db)
        {
            _logger = logger;
            _db = db;
        }

        [HttpPost]
        public IActionResult Post([FromBody] CompanyDTO _c)
        {
            if (string.IsNullOrWhiteSpace(_c.Name) || string.IsNullOrWhiteSpace(_c.Description))
            {
                _logger.LogError("Company data is null.");
                return BadRequest("Dados da companhia não podem ser nulos.");
            }
            try
            {
                Company c = new Company
                {
                    name = _c.Name,
                    description = _c.Description
                };
                _db.CreateCompany(c);
                return Ok(c);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar companhia.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var companies = _db.GetAllCompanies();
                if (companies == null || companies.Count == 0)
                {
                    return NotFound("Nenhuma companhia encontrada.");
                }
                return Ok(companies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter companhias.");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            try
            {
                var company = _db.GetCompanyById(id);
                if (company == null)
                {
                    return NotFound("Nenhuma companhia encontrada com o ID especificado.");
                }
                return Ok(company);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter companhia com ID {ID}", id);
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                _db.DeleteCompany(id);
                return Ok(new { message = "Companhia eliminada com sucesso." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao eliminar companhia com ID {ID}", id);
                return StatusCode(500, "Erro interno do servidor.");
            }
        }

        public class CompanyDTO
        {
            public string Name { get; set; } = "";
            public string Description { get; set; } = "";
        }
    }
}
