export async function sendEmail(opts:{to: string; subject: string; html?: string; text?: string}) 
{
    console.log(" ----FAKE EMAİL----");
    console.log("To", opts.to);
    console.log("Subject", opts.subject);
    if(opts.text) console.log("Text:", opts.text);
    if(opts.html) console.log("HTML:", opts.html);
    console.log("-----------");
    
}