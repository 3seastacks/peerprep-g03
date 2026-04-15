-- 1. Create the master Questions table (Updated)
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    topic_tags TEXT[], 
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    locked_by VARCHAR(255) DEFAULT NULL,
    locked_at TIMESTAMP DEFAULT NULL
);

-- 2. Create the Language Templates table (New)
CREATE TABLE question_templates (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL, -- 'python', 'cpp', 'java'
    starter_code TEXT,             -- The code the user sees first
    solution_code TEXT,            -- The reference solution
    UNIQUE(question_id, language)  -- Prevents duplicate Python entries for one question
);

INSERT INTO questions (title, description, difficulty, topic_tags) VALUES
-- Easy Questions (7)
('Two Sum', 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.', 'Easy', ARRAY['Arrays', 'Hash Tables']),
('Valid Parentheses', 'Given a string containing just characters, determine if the input string is valid.', 'Easy', ARRAY['Strings', 'Data Structures']),
('Merge Two Sorted Lists', 'Merge two sorted linked lists and return it as a sorted list.', 'Easy', ARRAY['Linked Lists', 'Recursion']),
('Best Time to Buy and Sell Stock', 'Find the maximum profit you can achieve by buying and selling a stock on different days.', 'Easy', ARRAY['Arrays', 'Dynamic Programming']),
('Valid Palindrome', 'Given a string, determine if it is a palindrome, considering only alphanumeric characters.', 'Easy', ARRAY['Strings', 'Two Pointers']),
('Invert Binary Tree', 'Given the root of a binary tree, invert the tree and return its root.', 'Easy', ARRAY['Trees', 'Recursion']),
('Missing Number', 'Find the one number in the range [0, n] that is missing from the array.', 'Easy', ARRAY['Bit Manipulation', 'Arrays']),

-- Medium Questions (7)
('Longest Substring Without Repeating Characters', 'Find the length of the longest substring without repeating characters.', 'Medium', ARRAY['Sliding Window', 'Strings', 'Hash Tables']),
('3Sum', 'Find all unique triplets in an array that give the sum of zero.', 'Medium', ARRAY['Two Pointers', 'Arrays', 'Sorting']),
('Container With Most Water', 'Find two lines that together with the x-axis form a container containing the most water.', 'Medium', ARRAY['Two Pointers', 'Arrays']),
('Number of Islands', 'Given an m x n 2D binary grid, return the number of islands.', 'Medium', ARRAY['Graphs', 'Searching']),
('Course Schedule', 'Determine if you can finish all courses given a list of prerequisites.', 'Medium', ARRAY['Graphs', 'Searching']),
('Coin Change', 'Find the fewest number of coins needed to make up a specific amount.', 'Medium', ARRAY['Dynamic Programming']),
('House Robber', 'Find the maximum amount of money you can rob without alerting the police.', 'Medium', ARRAY['Dynamic Programming']),

-- Hard Questions (7)
('Median of Two Sorted Arrays', 'Find the median of two sorted arrays with a time complexity of O(log(m+n)).', 'Hard', ARRAY['Arrays', 'Searching']),
('Trapping Rain Water', 'Calculate how much water an elevation map can trap after raining.', 'Hard', ARRAY['Two Pointers', 'Arrays', 'Sliding Window']),
('Merge k Sorted Lists', 'Merge k sorted linked lists and return it as one sorted list.', 'Hard', ARRAY['Linked Lists', 'Heap', 'Searching']),
('Sliding Window Maximum', 'Find the maximum value in each sliding window of size k.', 'Hard', ARRAY['Sliding Window', 'Arrays', 'Heap']),
('N-Queens', 'Place n queens on an n x n chessboard such that no two queens attack each other.', 'Hard', ARRAY['Recursion']),
('Word Ladder', 'Find the shortest transformation sequence from a begin word to an end word.', 'Hard', ARRAY['Graphs', 'Searching', 'Hash Tables']),
('Binary Tree Maximum Path Sum', 'Find the maximum path sum of any non-empty path in a binary tree.', 'Hard', ARRAY['Trees', 'Recursion', 'Dynamic Programming']);