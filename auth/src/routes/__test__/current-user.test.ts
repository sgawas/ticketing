import request from "supertest";

import { app } from "../../app";
import { authHelper } from "../../../src/test/auth-helper";

it("should return current user details when valid cookie passed", async () => {
  const cookie = await authHelper();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual("test@test.com");

  //console.log(response.body);
});

it("should return null when no cookie passed", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
