using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace projeto.Data.Models
{
    public class AssistanceRequest
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string reason { get; set; }

        [Required]
        public string subject { get; set; }

        [Required]
        public DateTime date { get; set; }

        // Optional target User/Driver
        public int? TargetUserID { get; set; }

        [ForeignKey("TargetUserID")]
        public virtual User? TargetUser { get; set; }
        public string status { get; set; } = "Open";

        public virtual ICollection<AssistanceMessage> Messages { get; set; } = new List<AssistanceMessage>();
    }
}
