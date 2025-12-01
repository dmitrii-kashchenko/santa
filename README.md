# AI Santa - Open Source Template 🎅

Create your own AI Santa variation with Tavus! This is a fully functional, festive microsite template that you can fork and customize to create any Santa personality you can imagine.

**By default, this template features Bad Santa** - but you can easily customize it to create a tropical Santa, a mall-cop Santa, a Santa who's clearly in witness protection... or something completely cursed.

## 🚀 Quick Start

**Before you start:** You'll need to create your own persona in Tavus - you cannot use the persona ID from this template. See step 4 for details!

### 1. Fork This Repo
Click the "Fork" button at the top of this page to create your own copy.

### 2. Sign Up to Tavus
1. Go to [Tavus](https://tavus.io) to learn more, then [sign up for a developer account](https://platform.tavus.io/auth/sign-up?is_developer=true)
2. Get your API key from the Tavus dashboard

### 3. Use the Santa Replica
This project uses a pre-made Santa replica. The replica ID is already configured in the code:
- **Replica ID**: `raa1d440ec4a`

You don't need to change this - just use it as-is!

### 4. Create Your Persona (Personality Prompt)

**⚠️ Important:** You **cannot** use the persona ID `p472056757c3` from this template - it's tied to a specific Tavus account and won't work with your API key. You **must** create your own persona!

#### Option A: Use the Bad Santa Prompt (Recommended)

Want to recreate Bad Santa? Steal the prompt and make your own:

1. Open [`BAD_SANTA_PROMPT.md`](./BAD_SANTA_PROMPT.md) in this repo - it contains the full Bad Santa personality prompt
2. Go to your [Tavus dashboard](https://platform.tavus.io) and create a new **Persona**
3. Copy the entire prompt from `BAD_SANTA_PROMPT.md` and paste it into the persona creation form
4. Save your persona and copy your **Persona ID** (it will look like `p472056757c3`)

#### Option B: Create Your Own Santa Variant

Create a completely custom Santa personality:

1. In the Tavus dashboard, create a new **Persona**
2. Write a personality prompt describing your Santa variant. Examples:
   - "A tropical Santa who lives on a beach, wears flip-flops, and talks about surfing instead of reindeer"
   - "A mall-cop Santa who's very serious about security and asks visitors for ID"
   - "A Santa who's clearly in witness protection and keeps looking over his shoulder"
3. Save your persona and copy your **Persona ID**

### 5. Add Your Persona ID to the Project

1. Open `api/create-conversation.js`
2. Find these lines (around line 232-233):
   ```javascript
   const HARDCODED_PERSONA_ID = 'p472056757c3'  // Replace with YOUR persona ID
   const HARDCODED_REPLICA_ID = 'raa1d440ec4a'
   ```
3. Replace `'p472056757c3'` with **your** Persona ID:
   ```javascript
   const HARDCODED_PERSONA_ID = 'your_persona_id_here'
   ```

### 6. Add Your API Key
1. Create a `.env` file in the root directory:
   ```env
   TAVUS_API_KEY=your_tavus_api_key_here
   ```
2. For production on Vercel, add `TAVUS_API_KEY` in your Vercel project settings (Environment Variables)

### 7. Deploy
```bash
npm install
npm run build
```

Deploy to Vercel (or your preferred hosting):
- Connect your GitHub repo to Vercel
- Add the `TAVUS_API_KEY` environment variable
- Deploy!

**Boom! Your very own Santa variant is live! 🎉**

## 🎨 What You Get

This template includes:
- ✅ Retro pixelated UI with draggable windows
- ✅ Full video call experience with AI Santa
- ✅ Camera/mic setup (hair check)
- ✅ Flappy Bird-style mini-game
- ✅ Christmas countdown timer
- ✅ Mobile-responsive design
- ✅ Multi-language support (20+ languages)

## 🛠️ Customization Guide

### Change the Theme/Colors
Edit `src/index.css` and `src/App.css` for global styles, or component-specific CSS modules.

### Modify the UI Text
- Hero text: `src/components/HeroText/HeroText.jsx`
- Button text: `src/components/CallControls/CallControls.jsx`
- End screen message: `src/components/CallEndedScreen/CallEndedScreen.jsx`

### Change Assets (Images/Videos)
1. Replace files in the `public/` directory
2. Update paths in `src/utils/assetPaths.js`

### Adjust the Countdown
Edit `src/hooks/useCountdown.js` to change the target date or countdown behavior.

### Add More Languages
Edit `src/utils/translations.js` to add or modify translations.

## 📋 Prerequisites

- Node.js 18+ and npm
- A Tavus account ([sign up for a developer account](https://platform.tavus.io/auth/sign-up?is_developer=true))
- A Tavus API key (get it from your Tavus dashboard)

Learn more about Tavus at [tavus.io](https://tavus.io)

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── VideoCallWindow/ # Main Santa video call window
│   ├── FlappySanta/     # Mini-game component
│   ├── CallControls/    # Answer call button
│   └── cvi/             # Tavus CVI components
├── hooks/               # Custom React hooks
│   ├── useTavusConversation.js  # Tavus API integration
│   └── useCountdown.js           # Christmas countdown
└── utils/               # Utility functions
    ├── assetPaths.js    # Asset path constants
    └── translations.js  # Multi-language support

api/
└── create-conversation.js  # Serverless function (edit persona ID here!)
```

## 🔧 Development

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
     ```env
     TAVUS_API_KEY=your_api_key_here
     ```

3. Start development server:
   ```bash
   vercel dev
   ```
   This runs both the Vite frontend and serverless functions locally.

4. Open `http://localhost:3000` in your browser

**Note**: Use `vercel dev` (not `npm run dev`) to run the serverless functions. The `npm run dev` command runs Vite only for quick frontend-only development.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🔑 Environment Variables

You only need one environment variable to get started:

- `TAVUS_API_KEY` - Your Tavus API key (get it from [platform.tavus.io](https://platform.tavus.io))

### ⚠️ Important: Protecting Your API Keys

**Never commit your `.env` file!** It's already in `.gitignore`, but here's how to verify it's safe before pushing:

1. **Check if `.env` is tracked by git:**
   ```bash
   git ls-files | grep "\.env$"
   ```
   If this shows `.env`, run `git rm --cached .env` to untrack it.

2. **Verify `.env` is ignored:**
   ```bash
   git check-ignore -v .env
   ```
   This should show that `.env` is in `.gitignore`.

3. **Check what will be committed:**
   ```bash
   git status
   ```
   Make sure `.env` is NOT listed (`.env.example` is fine - that's a template).

4. **Or use the verification script:**
   ```bash
   ./verify-env-safe.sh
   ```

**Note**: The `.env.example` file is a template and should be committed to help others set up the project.

## 🎯 How It Works

1. **User visits your site** → Sees the retro UI with countdown
2. **User clicks "ANSWER HIS CALL"** → Camera/mic setup screen
3. **Hair check completes** → Tavus conversation URL is generated
4. **Video call begins** → User talks to your custom AI Santa
5. **Call ends** → End screen with sharing options

The app uses:
- **Tavus** for AI video conversations
- **Daily.co** for video infrastructure
- **React + Vite** for the frontend
- **Vercel** for serverless functions

## 🐛 Troubleshooting

### "Tavus API key not found"
- Make sure you've created a `.env` file with `TAVUS_API_KEY=your_key`
- For Vercel, add the environment variable in project settings

### "Failed to create conversation"
- Verify your API key is correct
- Check that your Persona ID is valid in the Tavus dashboard
- Make sure the replica ID `raa1d440ec4a` is accessible with your account

### Video not loading
- Check browser console for errors
- Verify asset paths in `src/utils/assetPaths.js`
- Make sure files exist in `public/` directory

## 📚 Tech Stack

- **React 19.2.0** - UI framework
- **Vite 7.2.2** - Build tool
- **@tavus/cvi-ui** - Tavus Conversational Video Interface
- **@daily-co/daily-react** - Video calling infrastructure
- **Jotai** - State management

## 🎬 Tavus React Component Library

This project uses the [Tavus Conversational Video Interface (CVI) React Component Library](https://docs.tavus.io/sections/conversational-video-interface/component-library/overview) to style and manage the video call UI. The library provides pre-built components that let you create a conversational video interface in seconds.

### What is the Tavus React Component Library?

The Tavus CVI React component library is a complete set of pre-built components and hooks for integrating AI-powered video conversations into React applications. It includes:

- **Pre-built video chat components** - Ready-to-use conversation UI
- **Device management** - Camera, microphone, and screen sharing controls
- **Real-time audio/video processing** - Handles all the video call complexity
- **Customizable styling** - Fully customizable to match your brand
- **TypeScript support** - Full type definitions included

### Using the Library in Your Own Project

If you want to use the Tavus React Component Library in a different project (outside of this Santa template), here's how to get started:

#### 1. Initialize CVI in Your Project

```bash
npx @tavus/cvi-ui@latest init
```

This command:
- Creates a `cvi-components.json` config file
- Prompts for TypeScript preference
- Installs npm dependencies (`@daily-co/daily-react`, `@daily-co/daily-js`, `jotai`)

#### 2. Add CVI Components

```bash
npx @tavus/cvi-ui@latest add conversation
```

#### 3. Wrap Your App with the CVI Provider

In your root file (`main.tsx` or `index.tsx`):

```jsx
import { CVIProvider } from './components/cvi/components/cvi-provider';

function App() {
  return <CVIProvider>{/* Your app content */}</CVIProvider>;
}
```

#### 4. Add a Conversation Component

```jsx
import { Conversation } from './components/cvi/components/conversation';

function CVI() {
  const handleLeave = () => {
    // handle leave
  };
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <Conversation
        conversationUrl='YOUR_TAVUS_MEETING_URL'
        onLeave={handleLeave}
      />
    </div>
  );
}
```

**Note:** The Conversation component requires a parent container with defined dimensions to display properly. Ensure your body element has full dimensions (`width: 100%` and `height: 100%`) in your CSS.

### Learn More

- [Tavus CVI Component Library Documentation](https://docs.tavus.io/sections/conversational-video-interface/component-library/overview)
- [CVI UI Haircheck Conversation Example](https://docs.tavus.io/sections/conversational-video-interface/component-library/overview) - Example project with HairCheck and Conversation blocks
- [Create Conversation API Reference](https://docs.tavus.io/api-reference/conversations/create-conversation) - Learn how to generate conversation URLs

### How This Project Uses It

In this Santa template, we use the Tavus CVI library components located in `src/components/cvi/`:
- **Conversation component** - The main video call interface
- **HairCheck component** - Camera/mic setup screen
- **CVI Provider** - Wraps the app to provide CVI context

You can customize these components or use them as-is - they're fully functional out of the box!

## 📖 Additional Resources

- [Tavus](https://tavus.io) - Learn more about Tavus
- [Tavus Documentation](https://docs.tavus.io)
- [Sign up for Tavus](https://platform.tavus.io/auth/sign-up?is_developer=true) - Developer account sign-up
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Daily.co Documentation](https://docs.daily.co)

## 🤝 Contributing

Found a bug? Want to add a feature? Pull requests are welcome!

## 📝 License

[Add your license here]

---

**Made with ❤️ for the holiday season. Now go make something cursed! 🎅👹**
