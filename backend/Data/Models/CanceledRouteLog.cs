using System.ComponentModel.DataAnnotations;

namespace projeto.Data.Models
{
    public class CanceledRouteLog
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string RouteGroupId { get; set; }

        public int VehicleID { get; set; }

        [Required]
        public DateTime CancelationDate { get; set; } = DateTime.UtcNow;

        public string Reason { get; set; }

        public string Comment { get; set; }

        public bool ReturnedToUnassigned { get; set; }

        public string TaskIds { get; set; }
    }
}
