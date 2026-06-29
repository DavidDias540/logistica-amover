using System.ComponentModel.DataAnnotations;

namespace projeto.Data.Models
{
    public class Vehicle
    {
        [Key]
        public int ID { get; set; }
        [Required]
        public string VID { get; set; } // Vehicle Identification Number
        public string name { get; set; } = "";
        public string brand { get; set; } = "";
        public string model { get; set; } = "";
        public string status { get; set; } = "Disponível";
        public float batteryCapacity { get; set; }
        public float cargoCapacity { get; set; }
        public string? plate { get; set; }
        public string? maintenance_reason { get; set; }
        public DateTime? maintenance_date { get; set; }

        //FK
        public int? ownerID { get; set; } // User n - 1
        public int? companyID { get; set; } // Company n - 1

        //NAV
        public User owner { get; set; } // User n - 1 navigation
        public Company company { get; set; } // Company n - 1 navigation
    }
}
