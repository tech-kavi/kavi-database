'use strict';

const crypto = require('crypto');
const dayjs = require('dayjs');
const {v4: uuidv4} = require('uuid');

// @ts-ignore
const { ValidationError } = require('@strapi/utils').errors;
/**
 * magic-token controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::magic-token.magic-token', ({ strapi }) => ({
    async create(ctx){
        const { email,password } = ctx.request.body;
    if (!email) return ctx.badRequest('Email is required');
    if (!password) return ctx.badRequest('Passowrd is required');

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email } });
    if (!user) return ctx.notFound('User not found');

    const userService = strapi.plugin('users-permissions').service('user');
    const validPassword = await userService.validatePassword(
      password,
      user.password
    );

    if (!validPassword) {
          console.log("Invalid Password.");
          throw new ValidationError('Invalid password.');
      }

    // Generate unique token
    const token = uuidv4(); 
    const expiresAt = dayjs().add(15, 'minute').toDate();

    // Save token in magic-token collection

    await strapi.entityService.create('api::magic-token.magic-token', {
                data: {
                  user:user.email,
                  token,
                  expiresAt,
                  used:false,
                },
              });

    const magicLink = `${process.env.FRONTEND_URL}/magicLogin?token=${token}`;

    //Send email (via Strapi Email plugin)
    await strapi.plugin('email').service('email').send({
      to: email,
      subject: 'Your Magic Login Link',
      text: `Click here to login: ${magicLink}`,
      html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Magic Login Link</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" bgcolor="#f4f4f4" style="padding:20px;">
          <!-- Main container -->
          <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden;">
            <tr>
              <td align="center" bgcolor="#4F46E5" style="padding:30px 20px; color:#ffffff; font-family:Arial, sans-serif; font-size:24px; font-weight:bold;">
                Your Secure Login
              </td>
            </tr>
            <tr>
              <td style="padding:30px 20px; font-family:Arial, sans-serif; font-size:16px; color:#333333; line-height:1.6;">
                <p>Hello,</p>
                <p>You requested a secure login link. Click the button below to log in:</p>
                <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto;">
                  <tr>
                    <td align="center" bgcolor="#4F46E5" style="border-radius:5px;">
                      <a href="${magicLink}" target="_blank" 
                        style="display:inline-block; padding:12px 24px; font-family:Arial, sans-serif; font-size:16px; color:#ffffff; text-decoration:none; border-radius:5px;">
                        Login Now
                      </a>
                    </td>
                  </tr>
                </table>
                <p>This link will expire in <strong>15 minutes</strong>.</p>
                <p>If you didn’t request this, please ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#f4f4f4" style="padding:20px; text-align:center; font-family:Arial, sans-serif; font-size:12px; color:#777777;">
                © ${new Date().getFullYear()} KAVI. All rights reserved.
              </td>
            </tr>
          </table>
          <!-- End container -->
        </td>
      </tr>
    </table>
  </body>
  </html>
  `,
    });

    return ctx.send({ message: 'Magic link sent to email' });
    },










    async verify(ctx){

        const { token } = ctx.request.body;
    if (!token) return ctx.badRequest("Token is required");

    // const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Get record (use findFirst for single result)
      const record = await strapi.db.query("api::magic-token.magic-token").findOne({
        where: { token: token },
      });
      

     console.log(record);

    if (!record) return ctx.badRequest("Invalid token");
    if (record.used) return ctx.badRequest("Token already used");
    if (dayjs().isAfter(dayjs(record.expiresAt)))
      return ctx.badRequest("Token expired");

    const login_time = dayjs().toDate();
    // Mark token as used
      await strapi.documents("api::magic-token.magic-token").update({
      documentId:record.documentId,
      data: { 
        used: true,
        login_time,
       },
       status: 'published',
    });


  const user = await strapi.db.query('plugin::users-permissions.user').findOne({
  where: { email: record.user },
  select: ['id', 'username', 'email', 'confirmed', 'blocked', 'provider'], // fields you need
  populate: { role: true }, // include role
});

    // Issue JWT for user
    const jwt = strapi
      .plugin("users-permissions")
      .service("jwt")
      .issue({ id: user.id });

      
      return ctx.send({
        jwt,
        user: user,
      });
     }
}));
