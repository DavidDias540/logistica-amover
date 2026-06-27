using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace projeto.Data.Models
{
    public class AssistanceMessage
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int AssistanceRequestID { get; set; }

        [Required]
        public string text { get; set; }

        [Required]
        public string sender { get; set; } // e.g. "support" or "driver"

        [Required]
        public DateTime timestamp { get; set; }

        [ForeignKey("AssistanceRequestID")]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual AssistanceRequest? AssistanceRequest { get; set; }
    }
}
