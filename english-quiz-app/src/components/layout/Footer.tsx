'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const pathname = usePathname();

  const skills = [
    { name: 'Listening', parts: ['Part 1', 'Part 2', 'Part 3'] },
    { name: 'Reading', parts: ['Part 1', 'Part 2', 'Part 3', 'Part 4'] },
    { name: 'Writing', parts: ['Part 1', 'Part 2'] },
    { name: 'Speaking', parts: ['Question 1', 'Question 2', 'Question 3'] },
  ];

  return (
    <footer className="bg-gray-200 py-6 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {skills.map((skill) => (
            <div key={skill.name} className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-lg">{skill.name}</h3>
              <div className="flex flex-wrap gap-2">
                {skill.parts.map((part, index) => (
                  <Link
                    key={part}
                    href={`/quiz/${skill.name.toLowerCase()}/${index + 1}`}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      pathname.includes(`${skill.name.toLowerCase()}/${index + 1}`)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {part}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;