// ZI-TASK:

// Shunday function yozing, u function ishga tushgandan 3 soniyadan keyin "Hello World" ni qaytarsin.
// MASALAN: delayHelloWorld("Hello World") return "Hello World"

function delayHelloWorld(str: string): void {
  setTimeout(() => {
    console.log(str);
  }, 3000);
}

delayHelloWorld("Hello World");
