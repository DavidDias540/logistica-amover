namespace projeto.Data.Models
{
    public class LocationNodeTask
    {
        public int NodeID { get; set; }
        public LocationNode LocationNode { get; set; }

        public int TaskID { get; set; }
        public Task Task { get; set; }

        public int stopOrder { get; set; }

        public string? RouteGroupId { get; set; }
    }
}
