using System.ComponentModel.DataAnnotations;
namespace projeto.Data.Models
{
    public class User
    {
        [Key]
        public int ID { get; set; }
        [Required]
        public string name { get; set; }
        [Required]
        public string email { get; set; }
        [Required]
        public string password { get; set; }
        [Required]
        public string role { get; set; }

        public string? driverLicense { get; set; }
        public string? citizenCard { get; set; }
        public string? phone { get; set; }
        public string? address { get; set; }
        public string? photoUrl { get; set; }
        public bool is_active { get; set; } = true;
        public bool RequiresPasswordChange { get; set; } = false;

        //FK

        public int? companyID { get; set; }

        //NAV
        public virtual List<Task>? tasks { get; set; }
        public virtual List<Plan>? plans { get; set; } // 1 - n
        public virtual Company company { get; set; }
        public virtual List<Vehicle> vehicles { get; set; } // 1 - n
        public virtual List<Alert> targetedAlerts { get; set; } // 1 - n
        public virtual List<Alert> managedAlerts { get; set; } // 1 - n
    }
}
