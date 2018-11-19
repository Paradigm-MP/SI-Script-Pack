jcmp.resource_path = `package://`;

/**
 * Example resource_paths:
 * 
 * http://999.333.222.111/resources/packages/
 * The above uses the VPS versions of packages. Use this for the public server.
 * This stuff isn't really used anymore because there are some issues with loading it from the server.
 * 
 * package://
 * The above uses the local versions of packages. Use this for testing.
 * 
 * ** IMPORTANT **
 * If you use an external resource path (eg not package://), you MUST add it to "websites" in 
 * the clientside package.json of THIS package.
 * 
 */