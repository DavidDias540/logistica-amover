using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace projeto.Data.Models
{
    public class Maintenance
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int motorcycleid { get; set; }

        [Required]
        public string description { get; set; }

        [Required]
        public DateTime date { get; set; }

        [Required]
        public bool resolved { get; set; }

        [ForeignKey("motorcycleid")]
        public virtual Vehicle? Vehicle { get; set; }
    }
}
