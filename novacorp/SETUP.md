# Workshop setup (Automation Anywhere Community Edition)

Complete these before building. They are mandatory in the workshop cheatsheet.

1. **Sign up** for the free Community Edition (no credit card): https://www.automationanywhere.com/products/enterprise/community-edition
   Click Get Free Community Edition, register, verify your email, then log in and finish the sign-up fields. Your email will contain the **Control Room URL**.
2. **Log in to the Control Room** with Chrome or Edge (Internet Explorer is not supported). If needed, use Forgot password to set your password and security questions. Control Room home: https://community.cloud.automationanywhere.digital/#/home
3. **Install and connect the Bot Agent**: Manage > Devices > Connect Local Device, download the installer for your OS, run it, and confirm the device shows **Connected**. Without the Bot Agent, bots cannot run on your machine. (Recent versions support macOS.)
4. **Create the TaskBot**: Automation > Create > TaskBot, enter a name, click **Create & Edit**. The TaskBot workspace opens. Build the flow from `automation-anywhere-guide.md`.

Output: Control Room login works, device shows Connected, TaskBot workspace is open.
