using System.ComponentModel.DataAnnotations;
namespace projeto.Data.Models
{
    public class Client
    {
        [Key]
        public int ID { get; set; }
        [Required]
        public string name { get; set; }
        [Required]
        public string nif { get; set; }
        [Required]
        public string address { get; set; }

        public string? street { get; set; }
        public string? door_number { get; set; }
        public string? floor { get; set; }
        public string? postal_code { get; set; }
        public string? city { get; set; }

        [Required]
        public string phone { get; set; }
        [Required]
        public string email { get; set; }

        public int? companyID { get; set; }

        //NAV
        public virtual Company? company { get; set; }

        public virtual List<Task>? tasks { get; set; }
    }
}
