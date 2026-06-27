using projeto.Data;
using projeto.Data.Models;
using System.Collections.Generic;
using System.Linq;

namespace projeto.Services
{
    public class ClientServices
    {
        private readonly AMoverContext _db;

        public ClientServices(AMoverContext db)
        {
            _db = db;
        }

        public List<Client> GetClients()
        {
            return _db.clients.ToList();
        }

        public Client? GetClientByID(int id)
        {
            return _db.clients.FirstOrDefault(c => c.ID == id);
        }

        public void CreateClient(Client client)
        {
            _db.clients.Add(client);
            _db.SaveChanges();
        }

        public bool EditClient(Client client)
        {
            var existing = _db.clients.FirstOrDefault(c => c.ID == client.ID);
            if (existing == null) return false;

            existing.name = client.name;
            existing.nif = client.nif;
            existing.phone = client.phone;
            existing.email = client.email;
            existing.address = client.address;
            existing.street = client.street;
            existing.door_number = client.door_number;
            existing.floor = client.floor;
            existing.postal_code = client.postal_code;
            existing.city = client.city;
            existing.companyID = client.companyID;

            _db.SaveChanges();
            return true;
        }

        public bool DeleteClient(int id)
        {
            var target = _db.clients.FirstOrDefault(c => c.ID == id);
            if (target == null) return false;

            _db.clients.Remove(target);
            _db.SaveChanges();
            return true;
        }
    }
}
