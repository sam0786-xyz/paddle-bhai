/* ========================================
   Striver A2Z DSA Sheet – Structured Roadmap
   Ordered exactly like takeuforward.org/strivers-a2z-dsa-course
   Each step has topics, each topic has problems.
   ======================================== */

export const STRIVER_SHEET = [
  {
    step: 1,
    title: 'Learn the Basics',
    topics: [
      {
        name: 'Things to know in C++/Java/Python',
        problems: [
          { title: 'User Input / Output', difficulty: 'easy', link: 'https://takeuforward.org/c/user-input-output-in-c-java-python/' },
          { title: 'Data Types', difficulty: 'easy', link: 'https://takeuforward.org/c/data-types-in-c-java-python/' },
          { title: 'If-Else Statements', difficulty: 'easy', link: 'https://takeuforward.org/c/if-else-statements-in-c-java-python/' },
          { title: 'Switch Statement', difficulty: 'easy', link: 'https://takeuforward.org/c/switch-statement-in-c-java-python/' },
          { title: 'Arrays/Strings Basics', difficulty: 'easy', link: 'https://takeuforward.org/c/arrays-and-strings-basics-in-c-java-python/' },
          { title: 'For/While Loops', difficulty: 'easy', link: 'https://takeuforward.org/c/loops-in-c-java-python/' },
          { title: 'Functions', difficulty: 'easy', link: 'https://takeuforward.org/c/functions-in-c-java-python/' },
        ],
      },
      {
        name: 'Build-up Logical Thinking (Patterns)',
        problems: [
          { title: 'Pattern 1 – Rectangular Star', difficulty: 'easy', link: 'https://takeuforward.org/strivers-a2z-dsa-course/pattern-1-rectangular-star-pattern/' },
          { title: 'Pattern 2 – Right Triangle Star', difficulty: 'easy', link: 'https://takeuforward.org/strivers-a2z-dsa-course/pattern-2-right-angled-triangle-pattern/' },
          { title: 'Pattern 3 – Right Triangle Number', difficulty: 'easy', link: 'https://takeuforward.org/strivers-a2z-dsa-course/pattern-3-right-angled-number-pyramid-pattern/' },
          { title: 'Pattern 4 – Right Triangle Number II', difficulty: 'easy', link: 'https://takeuforward.org/strivers-a2z-dsa-course/pattern-4-right-angled-number-pyramid-ii-pattern/' },
          { title: 'Pattern 5 – Inverted Right Triangle', difficulty: 'easy', link: 'https://takeuforward.org/strivers-a2z-dsa-course/pattern-5-inverted-right-pyramid-pattern/' },
          { title: 'Pattern 6 – Inverted Number Triangle', difficulty: 'easy', link: 'https://takeuforward.org/strivers-a2z-dsa-course/pattern-6-inverted-numbered-right-pyramid-pattern/' },
        ],
      },
      {
        name: 'Learn Basic Maths',
        problems: [
          { title: 'Count Digits', difficulty: 'easy', link: 'https://leetcode.com/problems/number-of-digits-that-divide-a-number/' },
          { title: 'Reverse a Number', difficulty: 'easy', link: 'https://leetcode.com/problems/reverse-integer/' },
          { title: 'Check Palindrome', difficulty: 'easy', link: 'https://leetcode.com/problems/palindrome-number/' },
          { title: 'GCD or HCF', difficulty: 'easy', link: '' },
          { title: 'Armstrong Numbers', difficulty: 'easy', link: '' },
          { title: 'Print all Divisors', difficulty: 'easy', link: '' },
          { title: 'Check for Prime', difficulty: 'easy', link: '' },
        ],
      },
      {
        name: 'Learn Basic Recursion',
        problems: [
          { title: 'Print Name N Times using Recursion', difficulty: 'easy', link: '' },
          { title: 'Print 1 to N using Recursion', difficulty: 'easy', link: '' },
          { title: 'Print N to 1 using Recursion', difficulty: 'easy', link: '' },
          { title: 'Sum of First N Numbers', difficulty: 'easy', link: '' },
          { title: 'Factorial of N Numbers', difficulty: 'easy', link: '' },
          { title: 'Reverse an Array', difficulty: 'easy', link: '' },
          { title: 'Check if String is Palindrome', difficulty: 'easy', link: '' },
          { title: 'Fibonacci Number', difficulty: 'easy', link: 'https://leetcode.com/problems/fibonacci-number/' },
        ],
      },
      {
        name: 'Learn Basic Hashing',
        problems: [
          { title: 'Counting Frequencies of Array Elements', difficulty: 'easy', link: '' },
          { title: 'Find Highest/Lowest Frequency Element', difficulty: 'easy', link: '' },
        ],
      },
    ],
  },
  {
    step: 2,
    title: 'Sorting Techniques',
    topics: [
      {
        name: 'Sorting-I',
        problems: [
          { title: 'Selection Sort', difficulty: 'easy', link: '' },
          { title: 'Bubble Sort', difficulty: 'easy', link: '' },
          { title: 'Insertion Sort', difficulty: 'easy', link: '' },
        ],
      },
      {
        name: 'Sorting-II',
        problems: [
          { title: 'Merge Sort', difficulty: 'medium', link: 'https://leetcode.com/problems/sort-an-array/' },
          { title: 'Quick Sort', difficulty: 'medium', link: '' },
          { title: 'Recursive Bubble Sort', difficulty: 'easy', link: '' },
          { title: 'Recursive Insertion Sort', difficulty: 'easy', link: '' },
        ],
      },
    ],
  },
  {
    step: 3,
    title: 'Arrays',
    topics: [
      {
        name: 'Easy',
        problems: [
          { title: 'Largest Element in an Array', difficulty: 'easy', link: '' },
          { title: 'Second Largest Element', difficulty: 'easy', link: '' },
          { title: 'Check if Array is Sorted', difficulty: 'easy', link: '' },
          { title: 'Remove Duplicates from Sorted Array', difficulty: 'easy', link: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
          { title: 'Left Rotate an Array by One', difficulty: 'easy', link: '' },
          { title: 'Left Rotate Array by D Places', difficulty: 'medium', link: 'https://leetcode.com/problems/rotate-array/' },
          { title: 'Move Zeros to End', difficulty: 'easy', link: 'https://leetcode.com/problems/move-zeroes/' },
          { title: 'Linear Search', difficulty: 'easy', link: '' },
          { title: 'Union of Two Sorted Arrays', difficulty: 'easy', link: '' },
          { title: 'Missing Number', difficulty: 'easy', link: 'https://leetcode.com/problems/missing-number/' },
          { title: 'Maximum Consecutive Ones', difficulty: 'easy', link: 'https://leetcode.com/problems/max-consecutive-ones/' },
          { title: 'Single Number', difficulty: 'easy', link: 'https://leetcode.com/problems/single-number/' },
          { title: 'Two Sum', difficulty: 'easy', link: 'https://leetcode.com/problems/two-sum/' },
        ],
      },
      {
        name: 'Medium',
        problems: [
          { title: 'Sort an Array of 0s 1s and 2s', difficulty: 'medium', link: 'https://leetcode.com/problems/sort-colors/' },
          { title: 'Majority Element (> N/2)', difficulty: 'medium', link: 'https://leetcode.com/problems/majority-element/' },
          { title: 'Kadane\'s Algorithm (Max Subarray Sum)', difficulty: 'medium', link: 'https://leetcode.com/problems/maximum-subarray/' },
          { title: 'Stock Buy and Sell', difficulty: 'medium', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
          { title: 'Rearrange by Sign', difficulty: 'medium', link: '' },
          { title: 'Next Permutation', difficulty: 'medium', link: 'https://leetcode.com/problems/next-permutation/' },
          { title: 'Leaders in an Array', difficulty: 'medium', link: '' },
          { title: 'Longest Consecutive Sequence', difficulty: 'medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
          { title: 'Set Matrix Zeros', difficulty: 'medium', link: 'https://leetcode.com/problems/set-matrix-zeroes/' },
          { title: 'Rotate Matrix by 90 Degrees', difficulty: 'medium', link: 'https://leetcode.com/problems/rotate-image/' },
          { title: 'Spiral Matrix', difficulty: 'medium', link: 'https://leetcode.com/problems/spiral-matrix/' },
          { title: 'Subarray Sum Equals K', difficulty: 'medium', link: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
        ],
      },
      {
        name: 'Hard',
        problems: [
          { title: '3Sum', difficulty: 'hard', link: 'https://leetcode.com/problems/3sum/' },
          { title: '4Sum', difficulty: 'hard', link: 'https://leetcode.com/problems/4sum/' },
          { title: 'Merge Overlapping Intervals', difficulty: 'hard', link: 'https://leetcode.com/problems/merge-intervals/' },
          { title: 'Merge Sorted Arrays Without Extra Space', difficulty: 'hard', link: '' },
          { title: 'Find the Repeating and Missing Number', difficulty: 'hard', link: '' },
          { title: 'Count Inversions (Merge Sort)', difficulty: 'hard', link: '' },
          { title: 'Reverse Pairs', difficulty: 'hard', link: 'https://leetcode.com/problems/reverse-pairs/' },
          { title: 'Maximum Product Subarray', difficulty: 'hard', link: 'https://leetcode.com/problems/maximum-product-subarray/' },
        ],
      },
    ],
  },
  {
    step: 4,
    title: 'Binary Search',
    topics: [
      {
        name: 'BS on 1D Arrays',
        problems: [
          { title: 'Binary Search to Find X in Sorted Array', difficulty: 'easy', link: 'https://leetcode.com/problems/binary-search/' },
          { title: 'Lower Bound / Upper Bound', difficulty: 'easy', link: '' },
          { title: 'Search Insert Position', difficulty: 'easy', link: 'https://leetcode.com/problems/search-insert-position/' },
          { title: 'Floor/Ceil in Sorted Array', difficulty: 'easy', link: '' },
          { title: 'First and Last Occurrence', difficulty: 'medium', link: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/' },
          { title: 'Count Occurrences in Sorted Array', difficulty: 'easy', link: '' },
          { title: 'Search in Rotated Sorted Array', difficulty: 'medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
          { title: 'Search in Rotated Sorted Array II', difficulty: 'medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/' },
          { title: 'Find Minimum in Rotated Sorted Array', difficulty: 'medium', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
          { title: 'Single Element in Sorted Array', difficulty: 'medium', link: 'https://leetcode.com/problems/single-element-in-a-sorted-array/' },
          { title: 'Find Peak Element', difficulty: 'medium', link: 'https://leetcode.com/problems/find-peak-element/' },
        ],
      },
      {
        name: 'BS on Answers',
        problems: [
          { title: 'Square Root of a Number', difficulty: 'easy', link: 'https://leetcode.com/problems/sqrtx/' },
          { title: 'Nth Root of a Number', difficulty: 'medium', link: '' },
          { title: 'Koko Eating Bananas', difficulty: 'medium', link: 'https://leetcode.com/problems/koko-eating-bananas/' },
          { title: 'Minimum Days to Make M Bouquets', difficulty: 'medium', link: 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/' },
          { title: 'Find Smallest Divisor Given Threshold', difficulty: 'medium', link: 'https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/' },
          { title: 'Capacity to Ship Packages in D Days', difficulty: 'medium', link: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/' },
          { title: 'Aggressive Cows', difficulty: 'hard', link: '' },
          { title: 'Book Allocation / Painter\'s Partition', difficulty: 'hard', link: '' },
          { title: 'Split Array Largest Sum', difficulty: 'hard', link: 'https://leetcode.com/problems/split-array-largest-sum/' },
          { title: 'Median of Two Sorted Arrays', difficulty: 'hard', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
        ],
      },
    ],
  },
  {
    step: 5,
    title: 'Strings',
    topics: [
      {
        name: 'Basic & Medium String Problems',
        problems: [
          { title: 'Reverse Words in a String', difficulty: 'medium', link: 'https://leetcode.com/problems/reverse-words-in-a-string/' },
          { title: 'Largest Odd Number in String', difficulty: 'easy', link: 'https://leetcode.com/problems/largest-odd-number-in-string/' },
          { title: 'Longest Common Prefix', difficulty: 'easy', link: 'https://leetcode.com/problems/longest-common-prefix/' },
          { title: 'Isomorphic Strings', difficulty: 'easy', link: 'https://leetcode.com/problems/isomorphic-strings/' },
          { title: 'Check if Strings are Rotations', difficulty: 'easy', link: '' },
          { title: 'Valid Anagram', difficulty: 'easy', link: 'https://leetcode.com/problems/valid-anagram/' },
          { title: 'Sort Characters By Frequency', difficulty: 'medium', link: 'https://leetcode.com/problems/sort-characters-by-frequency/' },
          { title: 'Maximum Nesting Depth of Parentheses', difficulty: 'easy', link: 'https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/' },
          { title: 'Roman to Integer', difficulty: 'easy', link: 'https://leetcode.com/problems/roman-to-integer/' },
          { title: 'String to Integer (atoi)', difficulty: 'medium', link: 'https://leetcode.com/problems/string-to-integer-atoi/' },
        ],
      },
    ],
  },
  {
    step: 6,
    title: 'Linked List',
    topics: [
      {
        name: '1D Linked List',
        problems: [
          { title: 'Introduction to Linked List', difficulty: 'easy', link: '' },
          { title: 'Inserting a Node', difficulty: 'easy', link: '' },
          { title: 'Deleting a Node', difficulty: 'easy', link: '' },
          { title: 'Find Length of Linked List', difficulty: 'easy', link: '' },
          { title: 'Search in a Linked List', difficulty: 'easy', link: '' },
        ],
      },
      {
        name: 'Medium LL Problems',
        problems: [
          { title: 'Reverse Linked List', difficulty: 'easy', link: 'https://leetcode.com/problems/reverse-linked-list/' },
          { title: 'Middle of Linked List', difficulty: 'easy', link: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
          { title: 'Detect Cycle in LL', difficulty: 'medium', link: 'https://leetcode.com/problems/linked-list-cycle/' },
          { title: 'Starting Point of Loop', difficulty: 'medium', link: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
          { title: 'Length of Loop', difficulty: 'medium', link: '' },
          { title: 'Odd Even Linked List', difficulty: 'medium', link: 'https://leetcode.com/problems/odd-even-linked-list/' },
          { title: 'Remove Nth Node from End', difficulty: 'medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
          { title: 'Delete Middle Node', difficulty: 'medium', link: 'https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/' },
          { title: 'Sort Linked List', difficulty: 'medium', link: 'https://leetcode.com/problems/sort-list/' },
          { title: 'Palindrome Linked List', difficulty: 'medium', link: 'https://leetcode.com/problems/palindrome-linked-list/' },
          { title: 'Add Two Numbers', difficulty: 'medium', link: 'https://leetcode.com/problems/add-two-numbers/' },
          { title: 'Intersection of Two Linked Lists', difficulty: 'easy', link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/' },
        ],
      },
    ],
  },
  {
    step: 7,
    title: 'Recursion & Backtracking',
    topics: [
      {
        name: 'Medium Problems',
        problems: [
          { title: 'Subset Sum I', difficulty: 'medium', link: '' },
          { title: 'Subset Sum II', difficulty: 'medium', link: 'https://leetcode.com/problems/subsets-ii/' },
          { title: 'Combination Sum', difficulty: 'medium', link: 'https://leetcode.com/problems/combination-sum/' },
          { title: 'Combination Sum II', difficulty: 'medium', link: 'https://leetcode.com/problems/combination-sum-ii/' },
          { title: 'Permutations', difficulty: 'medium', link: 'https://leetcode.com/problems/permutations/' },
        ],
      },
      {
        name: 'Hard Problems',
        problems: [
          { title: 'N Queens', difficulty: 'hard', link: 'https://leetcode.com/problems/n-queens/' },
          { title: 'Sudoku Solver', difficulty: 'hard', link: 'https://leetcode.com/problems/sudoku-solver/' },
          { title: 'Rat in a Maze', difficulty: 'hard', link: '' },
          { title: 'Word Break', difficulty: 'hard', link: 'https://leetcode.com/problems/word-break/' },
          { title: 'Palindrome Partitioning', difficulty: 'hard', link: 'https://leetcode.com/problems/palindrome-partitioning/' },
        ],
      },
    ],
  },
  {
    step: 8,
    title: 'Stacks & Queues',
    topics: [
      {
        name: 'Learning',
        problems: [
          { title: 'Implement Stack using Arrays', difficulty: 'easy', link: '' },
          { title: 'Implement Queue using Arrays', difficulty: 'easy', link: '' },
          { title: 'Implement Stack using Queue', difficulty: 'medium', link: 'https://leetcode.com/problems/implement-stack-using-queues/' },
          { title: 'Implement Queue using Stack', difficulty: 'medium', link: 'https://leetcode.com/problems/implement-queue-using-stacks/' },
          { title: 'Valid Parentheses', difficulty: 'easy', link: 'https://leetcode.com/problems/valid-parentheses/' },
          { title: 'Min Stack', difficulty: 'medium', link: 'https://leetcode.com/problems/min-stack/' },
        ],
      },
      {
        name: 'Monotonic Stack/Queue Problems',
        problems: [
          { title: 'Next Greater Element I', difficulty: 'easy', link: 'https://leetcode.com/problems/next-greater-element-i/' },
          { title: 'Next Greater Element II', difficulty: 'medium', link: 'https://leetcode.com/problems/next-greater-element-ii/' },
          { title: 'Trapping Rain Water', difficulty: 'hard', link: 'https://leetcode.com/problems/trapping-rain-water/' },
          { title: 'Largest Rectangle in Histogram', difficulty: 'hard', link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
          { title: 'Sliding Window Maximum', difficulty: 'hard', link: 'https://leetcode.com/problems/sliding-window-maximum/' },
        ],
      },
    ],
  },
  {
    step: 9,
    title: 'Greedy Algorithms',
    topics: [
      {
        name: 'Easy to Medium',
        problems: [
          { title: 'Assign Cookies', difficulty: 'easy', link: 'https://leetcode.com/problems/assign-cookies/' },
          { title: 'Fractional Knapsack', difficulty: 'medium', link: '' },
          { title: 'Minimum Coins (Greedy)', difficulty: 'medium', link: '' },
          { title: 'Lemonade Change', difficulty: 'easy', link: 'https://leetcode.com/problems/lemonade-change/' },
          { title: 'Valid Parenthesis String', difficulty: 'medium', link: 'https://leetcode.com/problems/valid-parenthesis-string/' },
          { title: 'N Meetings in One Room', difficulty: 'easy', link: '' },
          { title: 'Jump Game', difficulty: 'medium', link: 'https://leetcode.com/problems/jump-game/' },
          { title: 'Jump Game II', difficulty: 'medium', link: 'https://leetcode.com/problems/jump-game-ii/' },
          { title: 'Minimum Platforms', difficulty: 'medium', link: '' },
          { title: 'Job Sequencing Problem', difficulty: 'medium', link: '' },
        ],
      },
    ],
  },
  {
    step: 10,
    title: 'Trees',
    topics: [
      {
        name: 'Traversals',
        problems: [
          { title: 'Inorder Traversal', difficulty: 'easy', link: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
          { title: 'Preorder Traversal', difficulty: 'easy', link: 'https://leetcode.com/problems/binary-tree-preorder-traversal/' },
          { title: 'Postorder Traversal', difficulty: 'easy', link: 'https://leetcode.com/problems/binary-tree-postorder-traversal/' },
          { title: 'Level Order Traversal (BFS)', difficulty: 'medium', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
        ],
      },
      {
        name: 'Medium Problems',
        problems: [
          { title: 'Height of Binary Tree', difficulty: 'easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
          { title: 'Balanced Binary Tree', difficulty: 'easy', link: 'https://leetcode.com/problems/balanced-binary-tree/' },
          { title: 'Diameter of Binary Tree', difficulty: 'easy', link: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
          { title: 'Same Tree', difficulty: 'easy', link: 'https://leetcode.com/problems/same-tree/' },
          { title: 'Lowest Common Ancestor of Binary Tree', difficulty: 'medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
          { title: 'Maximum Path Sum', difficulty: 'hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
        ],
      },
    ],
  },
  {
    step: 11,
    title: 'Graphs',
    topics: [
      {
        name: 'BFS / DFS',
        problems: [
          { title: 'BFS of Graph', difficulty: 'easy', link: '' },
          { title: 'DFS of Graph', difficulty: 'easy', link: '' },
          { title: 'Number of Islands', difficulty: 'medium', link: 'https://leetcode.com/problems/number-of-islands/' },
          { title: 'Flood Fill', difficulty: 'easy', link: 'https://leetcode.com/problems/flood-fill/' },
          { title: 'Rotten Oranges', difficulty: 'medium', link: 'https://leetcode.com/problems/rotting-oranges/' },
          { title: 'Detect Cycle (Undirected)', difficulty: 'medium', link: '' },
          { title: 'Detect Cycle (Directed) – DFS', difficulty: 'medium', link: '' },
        ],
      },
      {
        name: 'Shortest Path & Topo Sort',
        problems: [
          { title: 'Topological Sort (BFS – Kahn\'s)', difficulty: 'medium', link: '' },
          { title: 'Course Schedule I', difficulty: 'medium', link: 'https://leetcode.com/problems/course-schedule/' },
          { title: 'Course Schedule II', difficulty: 'medium', link: 'https://leetcode.com/problems/course-schedule-ii/' },
          { title: 'Dijkstra\'s Algorithm', difficulty: 'medium', link: '' },
          { title: 'Bellman Ford', difficulty: 'hard', link: '' },
          { title: 'Floyd Warshall', difficulty: 'hard', link: '' },
        ],
      },
    ],
  },
  {
    step: 12,
    title: 'Dynamic Programming',
    topics: [
      {
        name: '1D DP',
        problems: [
          { title: 'Climbing Stairs', difficulty: 'easy', link: 'https://leetcode.com/problems/climbing-stairs/' },
          { title: 'Frog Jump (Min cost to reach end)', difficulty: 'easy', link: '' },
          { title: 'House Robber', difficulty: 'medium', link: 'https://leetcode.com/problems/house-robber/' },
          { title: 'House Robber II', difficulty: 'medium', link: 'https://leetcode.com/problems/house-robber-ii/' },
        ],
      },
      {
        name: '2D/Grid DP + Subsequences',
        problems: [
          { title: 'Unique Paths', difficulty: 'medium', link: 'https://leetcode.com/problems/unique-paths/' },
          { title: 'Unique Paths II', difficulty: 'medium', link: 'https://leetcode.com/problems/unique-paths-ii/' },
          { title: 'Minimum Path Sum', difficulty: 'medium', link: 'https://leetcode.com/problems/minimum-path-sum/' },
          { title: 'Triangle', difficulty: 'medium', link: 'https://leetcode.com/problems/triangle/' },
          { title: 'Longest Common Subsequence', difficulty: 'medium', link: 'https://leetcode.com/problems/longest-common-subsequence/' },
          { title: 'Longest Increasing Subsequence', difficulty: 'medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
          { title: '0/1 Knapsack', difficulty: 'medium', link: '' },
          { title: 'Coin Change', difficulty: 'medium', link: 'https://leetcode.com/problems/coin-change/' },
          { title: 'Target Sum', difficulty: 'medium', link: 'https://leetcode.com/problems/target-sum/' },
          { title: 'Edit Distance', difficulty: 'hard', link: 'https://leetcode.com/problems/edit-distance/' },
        ],
      },
    ],
  },
];

// Flatten for quick lookup
export function getAllProblems() {
  const all = [];
  STRIVER_SHEET.forEach(step => {
    step.topics.forEach(topic => {
      topic.problems.forEach(p => {
        all.push({ ...p, step: step.step, stepTitle: step.title, topicName: topic.name });
      });
    });
  });
  return all;
}

export function getSheetProgress(solvedTitles) {
  const solved = new Set(solvedTitles.map(t => t.toLowerCase()));
  return STRIVER_SHEET.map(step => {
    let total = 0;
    let done = 0;
    step.topics.forEach(topic => {
      topic.problems.forEach(p => {
        total++;
        if (solved.has(p.title.toLowerCase())) done++;
      });
    });
    return { step: step.step, title: step.title, total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  });
}
