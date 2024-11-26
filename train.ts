// ZI-TASK:

// Shunday function yozing, u function ishga tushgandan 3 soniyadan keyin "Hello World" ni qaytarsin.
// MASALAN: delayHelloWorld("Hello World") return "Hello World"

function delayHelloWorld(str: string): void {
  setTimeout(() => {
    console.log(str);
  }, 3000);
}

delayHelloWorld("Hello World");

/* 

pm2 ls
pm2 start dist/server.js --name=GATORADE
pm2 start npm run start:prod --name=GATORADE
pm2 stop id
pm2 delete id
pm2 restart 0
pm2 monit
pm2 kill -> insta drops all sessions
 
frontEnd

pm2 start yarn --name REACT --interpreter cmd -- start:prod

*/
