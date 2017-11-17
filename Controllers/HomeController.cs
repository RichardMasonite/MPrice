using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Max.Pricing.UI.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }
        public ActionResult HTMLFile(string version, string url)
        {
            url = Request.ApplicationPath.EndsWith("/") ? Request.ApplicationPath + url : Request.ApplicationPath + "/" + url;
            return this.File(url, "text/html");
        }
    }
}
