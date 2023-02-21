const { spawn } = require('child_process');
const { isErrored } = require('stream');
const pythonProcess = spawn('python', ['./python/tweepy.py',"1","2"]);
const {sendMailFromDynamoNet} = require('./helpers/mailSender.js')



pythonProcess.stdout.on('data', (data) => {
  console.log(`${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

 pythonProcess.on('close', async(code) => {
  /////
  try{
      await sendMailFromDynamoNet('noysh1234@gmail.com');
     console.log(`child process exited with code ${code}`);
  }catch(err){
    console.error(`stderr: ${err}`);

  }

});
