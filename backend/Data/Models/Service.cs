using System.ComponentModel.DataAnnotations;
namespace projeto.Data.Models
{

    using System.Text.Json.Serialization;
    public class Service
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string category { get; set; }

        [Required]
        public string description { get; set; }

        //FK

        public int companyID { get; set; }

        //NAV
        [JsonIgnore]
        public virtual Company? company { get; set; }
        [JsonIgnore]
        public virtual List<Task>? tasks { get; set; }
    }
}
