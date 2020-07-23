using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dotnet_core_api_jwt_bearer
{
    public class VersionedItemLink
    {
        public int WorkItemId { get; set; }

        public string Path { get; set; }

        public string Comment { get; set; }

        public string CreatedBy { get; set; }

        public string ModifiedBy { get; set; }

        public string LinkStatus { get; set; }
    }
}
