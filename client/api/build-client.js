import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server. windows object is only defined on browser not on node.
    // reachout to service on other namespace. nextjs needs to reach ingress-nginx namespace and service ingress-nginx so to finally call auth service.
    return axios.create({
    //  baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      baseURL: "http://www.ticketing-app.xyz/",
      headers: req.headers
    });
  } else {
    // We must be on the browser
    return axios.create({
      baseUrl: "/"
    });
  }
};
