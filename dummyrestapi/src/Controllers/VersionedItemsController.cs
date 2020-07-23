using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace dotnet_core_api_jwt_bearer.Controllers
{
    [ApiController]
    [Route("api/versioneditem")]
    [ApiVersion("2020-07-15")]
    [Authorize()]
    public class VersionedItemsController : ControllerBase
    {
        // Simplest in mem state store I could think of
        private static Dictionary<int, LinkedList<VersionedItemLink>> _state = new Dictionary<int, LinkedList<VersionedItemLink>>();
        private readonly ILogger<VersionedItemsController> _logger;

        public VersionedItemsController(ILogger<VersionedItemsController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("{id}")]
        public IList<VersionedItemLink> GetVersionedItems(int id)
        {
            LinkedList<VersionedItemLink> result;
            _state.TryGetValue(id, out result);

            if (result != null){
                return result.ToList();
            } else {
                return new LinkedList<VersionedItemLink>().ToList();
            }
            
        }

        [HttpPost]
        [Route("{id}")]
        public ActionResult SaveVersionedItems(int id, [FromBody] VersionedItemLink payload)
        {

            LinkedList<VersionedItemLink> list;
            _state.TryGetValue(id, out list);

            if (list == null)
            {
                list = new LinkedList<VersionedItemLink>();
                list.AddLast(payload);
                _state.Add(id, list);
            } else
            {
                var itemToModify = list.ToList().Find((item) => item.Path == payload.Path);

                if (itemToModify != null) { 
                    list.Remove(itemToModify);
                }

                list.AddLast(payload);
            }

            return Ok();
        }

        [HttpPost]
        [Route("{id}/delete")]
        public ActionResult DeleteVersionedItems(int id, [FromBody] string path)
        {

            LinkedList<VersionedItemLink> list;
            _state.TryGetValue(id, out list);

            if (list != null)
            {
                var itemToDelete = list.ToList().Find((item) => item.Path == path);

                list.Remove(itemToDelete);
            }

            return Ok();
        }
    }
}
