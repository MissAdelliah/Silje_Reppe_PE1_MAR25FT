UPDATED README FOR PORTFOILIO 1

## Apis
BASE_API_URL = 'https://v2.api.noroff.dev';
AUTH_LOGIN_URL = `${BASE_API_URL}/auth/login`;
## USED
Javascript
HTML
CSS

## Author
MissAdelliah / Silje Reppe

WRITTEN ON THE EXAM:
### Here is what gpt was used for 
- blog post text
  ### example Me & My Better Half (With Four Legs 🐾)
Some people call them pets.
I call mine my better half.
If you ever wonder where I am, chances are I’m with my dog — walking without a destination, talking without expecting answers, breathing a little easier just because he’s there. He doesn’t need me to be productive, impressive, or put together. He just needs me to show up. And somehow, that’s always enough.
My dog knows me in ways few do. He’s seen me on my best days — laughing, creating, dreaming — and on my quiet ones, when the world feels heavy and words are hard to find. He never asks what’s wrong, never rushes me to feel better. He simply stays. Curled up beside me. Head on my knee. Tail giving a small, steady wag as if to say, I’m here. That’s all that matters.
We have our rituals. Slow mornings. Long walks where time stretches and worries shrink. Silent conversations made of glances and gestures only we understand. He listens to everything — my plans, my doubts, my half-formed ideas — and treats them all like secrets worth keeping.
There’s something grounding about loving a dog. He lives fully in the present. A smell on the wind is exciting. A familiar path feels safe. A simple moment can be the best part of the day. Through him, I’m reminded to slow down, to notice, to feel. To be softer with myself.
People say dogs reflect their owners. If that’s true, then maybe he carries the parts of me I sometimes forget — loyalty, warmth, resilience, and an open heart. Or maybe I’m learning those things from him, one walk at a time.
He’s not just my dog.
He’s my shadow. My comfort. My calm.
My better half — with muddy paws and a heart bigger than the world.
And honestly?
Life makes a lot more sense with him by my side. 🐕✨
If you want, I can rewrite this in a shorter Instagram-style version, make it more poetic, more playful, or tailor it to sound like it belongs on your personal portfolio or website 💛
write a post with a poes about becoming a mom and excited to meet the baby
4
Becoming a Mom

I’m becoming a mother
in the quiet spaces between heartbeats.
In the way my hands rest gently,
already knowing where you are.
You haven’t arrived yet,
but you are everywhere.
In my thoughts when the day slows down,
in the pauses where I imagine your face,
in the future unfolding softly before me.
My body is changing,
learning you by heart before my eyes ever can.
Every movement is a whisper:
I’m here.
And every whisper answers something deep in me:
So am I.
I wonder who you’ll be.
Who you’ll become.
What parts of me you’ll carry forward,
and what will be entirely your own.
I wonder about your laugh,
your quiet moments,
the way you’ll fit into this world —
and into my arms.
There is excitement here, yes,
but also awe.
A tender kind of courage.
A love growing faster than I can explain,
stronger than anything I’ve known before.
I haven’t met you yet,
but I already love you in a way
that feels ancient and brand new all at once.
I’m ready to meet you.
Whenever you are ready to arrive. 🤍

### understanding errors and debug
(had problem js not running, sended screenshot on devtool for better understanding)
You actually did delete it — the problem is that the browser is still executing old JavaScript and it stops your file before the fetch runs.
The key clue is this error 👇
Uncaught ReferenceError: cancelBtn is not defined
at edit.js:197
Because of this error, everything after that line never executes, including fetching the blog post.
(help me understand this error)
Why you’re getting 401 (most likely reasons)
One of these is true:
❌ A) The user is not registered
If this email was never created via /auth/register, login will always return 401.
👉 Test this:
Go to your register page
Create the account first
Then try login with the same email + password
❌ B) Your login.js is storing the token wrong
If your code does:
const accessToken = json.accessToken;
→ You are saving undefined, which breaks everything after login.
If you still get 401 after this
Then it’s almost certainly one of these:
The user test@stud.noroff.no is not registered (or registered under a different password)
Password is wrong (case sensitive)
You’re using the wrong email domain vs what you registered

### What is a token? (in plain language)
A token is like a digital ID card that proves:
“I am logged in, and the server knows who I am.”
More formally, it’s usually called an access token (often a JWT).
Think of it like this:
Real life	Web app
You show your passport at airport	You send a token to the API
The airport verifies your passport	The API verifies your token
Then you’re allowed to board	Then you’re allowed to access protected data


