import React, { useEffect, useState } from "react";

// Sample array of finance-related quotes.
// You can expand this list to about 200 quotes as needed.
const financeQuotes = [
  {
    quote: "Beware of little expenses; a small leak will sink a great ship.",
    author: "Benjamin Franklin",
  },
  {
    quote: "The goal isn’t more money. The goal is living life on your terms.",
    author: "Chris Brogan",
  },
  {
    quote:
      "A budget is telling your money where to go instead of wondering where it went.",
    author: "Dave Ramsey",
  },
  {
    quote:
      "Do not save what is left after spending, but spend what is left after saving.",
    author: "Warren Buffett",
  },
  {
    quote:
      "It’s not your salary that makes you rich, it’s your spending habits.",
    author: "Charles A. Jaffe",
  },
  {
    quote:
      "The habit of saving is itself an education; it fosters every virtue.",
    author: "T.T. Munger",
  },
  {
    quote:
      "Financial freedom is available to those who learn about it and work for it.",
    author: "Robert Kiyosaki",
  },
  {
    quote:
      "We make a living by what we get, but we make a life by what we give.",
    author: "Winston Churchill",
  },
  {
    quote: "If you live for having it all, what you have is never enough.",
    author: "Vicki Robin",
  },
  {
    quote:
      "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.",
    author: "Ayn Rand",
  },
  { quote: "Frugality includes all the other virtues.", author: "Cicero" },
  {
    quote:
      "Too many people spend money they haven't earned, to buy things they don't want, to impress people they don't like.",
    author: "Will Rogers",
  },
  {
    quote:
      "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
    author: "Philip Fisher",
  },
  {
    quote:
      "Financial peace isn’t the acquisition of stuff. It’s learning to live on less than you make.",
    author: "Dave Ramsey",
  },
  {
    quote:
      "Never depend on a single income. Make investment to create a second source.",
    author: "Warren Buffett",
  },
  {
    quote: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    quote: "Price is what you pay; value is what you get.",
    author: "Warren Buffett",
  },
  {
    quote:
      "Financial fitness is not a pipe dream or a state of mind; it’s a reality if you are willing to pursue it and embrace it.",
    author: "Will Robinson",
  },
  {
    quote:
      "Wealth consists not in having great possessions, but in having few wants.",
    author: "Epictetus",
  },
  {
    quote:
      "The real measure of your wealth is how much you’d be worth if you lost all your money.",
    author: "Unknown",
  },
  {
    quote:
      "It’s not about having a lot of money. It’s knowing how to manage it.",
    author: "T. Harv Eker",
  },
  {
    quote: "The art is not in making money, but in keeping it.",
    author: "Proverb",
  },
  {
    quote: "Money grows on the tree of persistence.",
    author: "Japanese Proverb",
  },
  {
    quote:
      "Spend your money on the things money can buy. Spend your time on the things money can’t buy.",
    author: "Japanese Proverb",
  },
  {
    quote:
      "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
  },
  {
    quote: "Every day is a bank account, and time is our currency.",
    author: "Christopher Rice",
  },
  {
    quote:
      "Financial freedom is not about getting rich quickly. It's about creating a plan and sticking to it.",
    author: "Unknown",
  },
  {
    quote: "Richness is not about what you have, but what you can give.",
    author: "Unknown",
  },
  {
    quote: "Wealth is the product of a man's capacity to think.",
    author: "Ayn Rand",
  },
  {
    quote: "A penny saved is a penny earned.",
    author: "Benjamin Franklin",
  },
  {
    quote:
      "The secret to wealth is simple: find a way to do more for others than anyone else does.",
    author: "Tony Robbins",
  },
  {
    quote: "Money won't create success, the freedom to make it will.",
    author: "Nelson Mandela",
  },
  {
    quote:
      "Financial security and independence are like a three-legged stool resting on savings, insurance, and investments.",
    author: "Brian Tracy",
  },
  {
    quote:
      "Success is not just making money. Success is happiness. Success is fulfillment; it’s the ability to give.",
    author: "Adam Neumann",
  },
  {
    quote:
      "The stock market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett",
  },
  {
    quote: "Financial success requires both discipline and patience.",
    author: "Unknown",
  },
  {
    quote:
      "The only wealth which you will keep forever is the wealth you have given away.",
    author: "Marcus Aurelius",
  },
  {
    quote:
      "Time is more valuable than money. You can get more money, but you cannot get more time.",
    author: "Jim Rohn",
  },
  {
    quote:
      "Formal education will make you a living; self-education will make you a fortune.",
    author: "Jim Rohn",
  },
  {
    quote:
      "Not everything that can be counted counts, and not everything that counts can be counted.",
    author: "Albert Einstein",
  },
  {
    quote: "The biggest risk of all is not taking one.",
    author: "Mellody Hobson",
  },
  {
    quote: "Invest in yourself. Your career is the engine of your wealth.",
    author: "Paul Clitheroe",
  },
  {
    quote: "Money is a terrible master but an excellent servant.",
    author: "P.T. Barnum",
  },
  {
    quote:
      "It is not the man who has too little, but the man who craves more, that is poor.",
    author: "Seneca",
  },
  {
    quote:
      "Investing should be more like watching paint dry or watching grass grow. If you want excitement, take $800 and go to Las Vegas.",
    author: "Paul Samuelson",
  },
  {
    quote:
      "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau",
  },
  {
    quote:
      "The quickest way to double your money is to fold it over and put it back in your pocket.",
    author: "Will Rogers",
  },
  {
    quote:
      "Do not wait to strike till the iron is hot; but make it hot by striking.",
    author: "William Butler Yeats",
  },
  {
    quote: "The best way to predict your future is to create it.",
    author: "Peter Drucker",
  },
  {
    quote: "Opportunities don't happen. You create them.",
    author: "Chris Grosser",
  },
  {
    quote:
      "A successful investor is usually an individual who is inherently curious about market behavior.",
    author: "Unknown",
  },
  {
    quote:
      "Investing isn’t about beating others at their game. It’s about controlling yourself at your own game.",
    author: "Benjamin Graham",
  },
  {
    quote: "In investing, what is comfortable is rarely profitable.",
    author: "Robert Arnott",
  },
  {
    quote:
      "The four most dangerous words in investing are: 'this time it's different.'",
    author: "Sir John Templeton",
  },
  {
    quote: "Successful investing is about managing risk, not avoiding it.",
    author: "Benjamin Graham",
  },
  {
    quote:
      "The individual investor should act consistently as an investor and not as a speculator.",
    author: "Benjamin Graham",
  },
  {
    quote: "Know what you own, and know why you own it.",
    author: "Peter Lynch",
  },
  {
    quote:
      "Investing is laying out money now to get more money back in the future.",
    author: "Warren Buffett",
  },
  {
    quote: "Financial success is a marathon, not a sprint.",
    author: "Unknown",
  },
  {
    quote: "Risk comes from not knowing what you're doing.",
    author: "Warren Buffett",
  },
  {
    quote: "The best investment you can make is in yourself.",
    author: "Warren Buffett",
  },
  {
    quote: "Never invest in a business you cannot understand.",
    author: "Warren Buffett",
  },
  {
    quote: "Spend wisely, invest smartly, and save diligently.",
    author: "Unknown",
  },
  {
    quote: "Financial discipline is the key to building wealth over time.",
    author: "Unknown",
  },
  {
    quote: "Budgeting is the first step in achieving financial freedom.",
    author: "Unknown",
  },
  {
    quote: "Money is a good servant but a bad master.",
    author: "Francis Bacon",
  },
  {
    quote:
      "Don't let money run your life, let money help you run your life better.",
    author: "John Rampton",
  },
  {
    quote: "True wealth is the ability to fully experience life.",
    author: "Henry David Thoreau",
  },
  {
    quote:
      "Financial success comes from making the right decisions with your money.",
    author: "Unknown",
  },
  {
    quote: "Compound interest is the most powerful force in the universe.",
    author: "Albert Einstein",
  },
  {
    quote: "The more you learn, the more you earn.",
    author: "Warren Buffett",
  },
  {
    quote: "Investment is the intersection of economics and psychology.",
    author: "Seth Klarman",
  },
  {
    quote:
      "Riches do not exhilarate us so much with their possession as they torment us with their loss.",
    author: "Epicurus",
  },
  {
    quote:
      "Money, like emotions, is something you must control to keep your life on the right track.",
    author: "Unknown",
  },
  {
    quote: "Managing money is a matter of discipline and perspective.",
    author: "Unknown",
  },
  {
    quote:
      "When it comes to money, the rules are simple: Save, invest, and avoid debt.",
    author: "Unknown",
  },
  {
    quote: "Smart investing is about minimizing mistakes and maximizing gains.",
    author: "Unknown",
  },
  {
    quote: "Do what you love, and the money will follow.",
    author: "Marsha Sinetar",
  },
  {
    quote:
      "It’s easier to feel a little more spiritual with a couple of bucks in your pocket.",
    author: "Craig Ferguson",
  },
  {
    quote:
      "Budgeting isn’t about limiting yourself—it’s about making the things that excite you possible.",
    author: "Unknown",
  },
  {
    quote:
      "Savings, once accumulated, can be invested to generate further savings.",
    author: "Unknown",
  },
  {
    quote:
      "A wise person should have money in their head, but not in their heart.",
    author: "Jonathan Swift",
  },
  {
    quote: "Money often costs too much.",
    author: "Ralph Waldo Emerson",
  },
  {
    quote: "Financial freedom is a journey, not a destination.",
    author: "Unknown",
  },
  {
    quote: "Wealth is not his that has it, but his that enjoys it.",
    author: "Benjamin Franklin",
  },
  {
    quote: "Don’t let making a living prevent you from making a life.",
    author: "John Wooden",
  },
  {
    quote:
      "There is no dignity quite so impressive, and no independence quite so important, as living within your means.",
    author: "Calvin Coolidge",
  },
  {
    quote:
      "Financial independence is the ability to live from the income of your own personal resources.",
    author: "Jim Rohn",
  },
  {
    quote:
      "To acquire money requires valor, to keep money requires prudence, and to spend money well is an art.",
    author: "Berthold Auerbach",
  },
  {
    quote:
      "You must gain control over your money or the lack of it will forever control you.",
    author: "Dave Ramsey",
  },
  {
    quote: "A good reputation is more valuable than money.",
    author: "Publilius Syrus",
  },
  {
    quote:
      "The goal of the investor should be to purchase at a price that makes sense, not at the peak of hype.",
    author: "Unknown",
  },
  {
    quote:
      "If you want to feel rich, just count the things you have that money can't buy.",
    author: "Unknown",
  },
  {
    quote:
      "Financial intelligence is like compound interest; it compounds over time.",
    author: "Unknown",
  },
  {
    quote: "Invest in what you understand and understand what you invest in.",
    author: "Peter Lynch",
  },
  {
    quote: "Money is a tool for creating opportunities, not a goal in itself.",
    author: "Unknown",
  },
  {
    quote:
      "A wise investor learns from mistakes and celebrates small victories.",
    author: "Unknown",
  },
  {
    quote:
      "Successful investing is about patience, discipline, and a long-term perspective.",
    author: "Unknown",
  },
  {
    quote: "The more you save, the more you can invest for your future.",
    author: "Unknown",
  },
  {
    quote: "Budgeting is the foundation of any financial plan.",
    author: "Unknown",
  },
  {
    quote: "Wealth is built by consistently saving a portion of your income.",
    author: "Unknown",
  },
  {
    quote:
      "Investing is not a get-rich-quick scheme, but a get-rich-slow plan.",
    author: "Unknown",
  },
  {
    quote:
      "The key to financial success is to spend less than you earn and invest the difference.",
    author: "Unknown",
  },
  {
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
  },
  {
    quote: "Financial literacy is the first step towards financial freedom.",
    author: "Unknown",
  },
  {
    quote:
      "Money is the seed that, if properly nurtured, can grow into a forest of wealth.",
    author: "Unknown",
  },
  {
    quote: "Understanding money is the first step towards understanding life.",
    author: "Unknown",
  },
  {
    quote: "It’s not how much money you make, but how much money you keep.",
    author: "Unknown",
  },
  {
    quote: "Every dollar saved is a dollar earned.",
    author: "Unknown",
  },
  {
    quote: "In the world of finance, patience is the most valuable asset.",
    author: "Unknown",
  },
  {
    quote: "A clear budget leads to a clear mind.",
    author: "Unknown",
  },
  {
    quote: "Success is built on discipline, planning, and consistency.",
    author: "Unknown",
  },
  {
    quote: "Every expense is a vote for the kind of world you want to live in.",
    author: "Unknown",
  },
  {
    quote: "The habit of saving is the key to a secure future.",
    author: "Unknown",
  },
  {
    quote: "The secret of wealth is to make your money work for you.",
    author: "Unknown",
  },
  {
    quote:
      "Investing is the process of committing money today for a future reward.",
    author: "Unknown",
  },
  {
    quote: "The greatest wealth is to live content with little.",
    author: "Plato",
  },
  {
    quote:
      "Financial freedom is not about having a lot of money; it's about having choices.",
    author: "Unknown",
  },
  {
    quote: "A goal without a plan is just a wish.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    quote: "The money you invest today is the security you enjoy tomorrow.",
    author: "Unknown",
  },
  {
    quote:
      "Planning your financial future is the first step towards a secure retirement.",
    author: "Unknown",
  },
  {
    quote:
      "The only limit to your financial success is the one you set for yourself.",
    author: "Unknown",
  },
  {
    quote: "Investing should be a lifelong habit.",
    author: "Unknown",
  },
  {
    quote: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki",
  },
  {
    quote: "If you don't control your money, someone else will.",
    author: "Unknown",
  },
  {
    quote:
      "Save a little money each month and at the end of the year you'll be surprised at how little you have.",
    author: "Ernest Haskins",
  },
  {
    quote:
      "Financial success is the result of consistently making good decisions.",
    author: "Unknown",
  },
  {
    quote: "The journey to financial freedom begins with a single step.",
    author: "Unknown",
  },
  {
    quote: "Money is a reflection of your choices.",
    author: "Unknown",
  },
  {
    quote: "Investing in yourself is the best investment you will ever make.",
    author: "Unknown",
  },
  {
    quote: "Your wealth is determined by your choices, not your income.",
    author: "Unknown",
  },
  {
    quote: "Debt is the enemy of wealth.",
    author: "Unknown",
  },
  {
    quote: "Money saved is money earned.",
    author: "Unknown",
  },
  {
    quote: "It's not about having money, it's about having options.",
    author: "Chris Rock",
  },
  {
    quote: "The disciplined investor is rewarded over the long term.",
    author: "Unknown",
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    quote: "Financial planning is a continuous process.",
    author: "Unknown",
  },
  {
    quote: "Budgeting is the cornerstone of wealth building.",
    author: "Unknown",
  },
  {
    quote: "Money management is an art that everyone can learn.",
    author: "Unknown",
  },
  {
    quote:
      "Rich people have small TVs and big libraries, and poor people have small libraries and big TVs.",
    author: "Zig Ziglar",
  },
  {
    quote:
      "Financial success is not measured by money, but by the freedom it provides.",
    author: "Unknown",
  },
  {
    quote:
      "The road to financial freedom is paved with discipline and consistency.",
    author: "Unknown",
  },
  {
    quote: "Investing is not about timing the market, but time in the market.",
    author: "Unknown",
  },
  {
    quote:
      "The best way to double your money is to fold it over and put it back in your pocket.",
    author: "Unknown",
  },
  {
    quote: "Never spend your money before you have earned it.",
    author: "Thomas Jefferson",
  },
  {
    quote: "Frugality is the foundation of wealth.",
    author: "Unknown",
  },
  {
    quote: "A wise person saves for a rainy day, not just for a sunny day.",
    author: "Unknown",
  },
  {
    quote: "Your spending habits determine your financial future.",
    author: "Unknown",
  },
  {
    quote:
      "A solid financial plan starts with a clear understanding of your income and expenses.",
    author: "Unknown",
  },
  {
    quote: "Money management is the cornerstone of financial freedom.",
    author: "Unknown",
  },
  {
    quote: "Investing wisely is about balancing risk and reward.",
    author: "Unknown",
  },
  {
    quote: "The more you know, the more you grow financially.",
    author: "Unknown",
  },
  {
    quote: "Financial independence is the ultimate form of freedom.",
    author: "Unknown",
  },
  {
    quote: "Small steps lead to big financial gains.",
    author: "Unknown",
  },
  {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    quote: "Financial success is built one smart decision at a time.",
    author: "Unknown",
  },
  {
    quote: "Money can buy freedom if used correctly.",
    author: "Unknown",
  },
  {
    quote: "Invest in experiences, not just possessions.",
    author: "Unknown",
  },
  {
    quote:
      "Budgeting isn't about depriving yourself, it's about making room for what truly matters.",
    author: "Unknown",
  },
  {
    quote: "Be mindful of your money, and it will be mindful of you.",
    author: "Unknown",
  },
  {
    quote: "Financial wisdom comes from learning from your mistakes.",
    author: "Unknown",
  },
  {
    quote:
      "Success in finance is not just about earning, it's about saving and investing wisely.",
    author: "Unknown",
  },
  {
    quote: "Money is a reflection of the energy you put into it.",
    author: "Unknown",
  },
  {
    quote: "Your financial habits today determine your wealth tomorrow.",
    author: "Unknown",
  },
  {
    quote: "The best investment you can make is in your future self.",
    author: "Unknown",
  },
  {
    quote:
      "Financial discipline is the bridge between goals and accomplishment.",
    author: "Unknown",
  },
  {
    quote: "Mastering your money is mastering your life.",
    author: "Unknown",
  },
  {
    quote: "The power to create wealth is in your hands.",
    author: "Unknown",
  },
  {
    quote: "Financial freedom is achieved through smart choices and patience.",
    author: "Unknown",
  },
  {
    quote: "Investing in the market requires both courage and common sense.",
    author: "Unknown",
  },
  {
    quote:
      "Wealth is not about having a lot of money; it’s about having a lot of options.",
    author: "Chris Rock",
  },
  {
    quote: "Your financial journey is a marathon, not a sprint.",
    author: "Unknown",
  },
  {
    quote:
      "Every investment carries risk, but not investing carries greater risk.",
    author: "Unknown",
  },
  {
    quote:
      "The best time to invest was yesterday; the second best time is today.",
    author: "Unknown",
  },
  {
    quote: "Keep your eyes on your goals, and let your savings pave the way.",
    author: "Unknown",
  },
  {
    quote: "Wealth is created by making wise choices over time.",
    author: "Unknown",
  },
  {
    quote:
      "The true measure of wealth is how much you’d be worth if you lost all your money.",
    author: "Unknown",
  },
  {
    quote:
      "Money is the seed that, when planted wisely, can grow into a forest of abundance.",
    author: "Unknown",
  },
  {
    quote: "Your financial health is as important as your physical health.",
    author: "Unknown",
  },
  {
    quote: "A clear vision and a sound financial plan are the keys to success.",
    author: "Unknown",
  },
  {
    quote:
      "Never let temporary setbacks derail your long-term financial goals.",
    author: "Unknown",
  },
  {
    quote: "Wise investments today secure your tomorrow.",
    author: "Unknown",
  },
  {
    quote: "Be proactive about your money and let it work for you.",
    author: "Unknown",
  },
  {
    quote: "Every financial decision is a step towards your future.",
    author: "Unknown",
  },
  {
    quote: "Build your wealth slowly, and let time be your greatest ally.",
    author: "Unknown",
  },
  {
    quote: "The journey to financial independence begins with a single saving.",
    author: "Unknown",
  },
  {
    quote: "Financial acumen is the secret to building lasting wealth.",
    author: "Unknown",
  },
  {
    quote: "Investing is the art of making your money multiply.",
    author: "Unknown",
  },
  {
    quote: "Good money management can change your life.",
    author: "Unknown",
  },
  {
    quote: "Start where you are, use what you have, and do what you can.",
    author: "Arthur Ashe",
  },
  {
    quote:
      "The foundation of financial stability is built on a strong savings habit.",
    author: "Unknown",
  },
  {
    quote: "Your future is shaped by the financial decisions you make today.",
    author: "Unknown",
  },
  {
    quote: "Keep investing in your future; every little bit counts.",
    author: "Unknown",
  },
  {
    quote: "Money is a tool—use it wisely, and it will serve you well.",
    author: "Unknown",
  },
  {
    quote: "Financial security is built on smart, consistent habits.",
    author: "Unknown",
  },
  {
    quote: "The secret of getting ahead financially is getting started.",
    author: "Mark Twain",
  },
  {
    quote: "A plan, a goal, and persistence can turn your finances around.",
    author: "Unknown",
  },
  {
    quote: "Let your money work for you, not against you.",
    author: "Unknown",
  },
  {
    quote: "Financial empowerment comes from taking control of your money.",
    author: "Unknown",
  },
];


const FinanceQuote = () => {
  const [selectedQuote, setSelectedQuote] = useState({ quote: "", author: "" });

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * financeQuotes.length);
    setSelectedQuote(financeQuotes[randomIndex]);
  }, []);

  return (
    <div
      className="alert alert-info text-center"
      style={{ fontStyle: "italic", marginBottom: "1.5rem" }}
    >
      "{selectedQuote.quote}"{" "}
      {selectedQuote.author && <span>– {selectedQuote.author}</span>}
    </div>
  );
};

export default FinanceQuote;
