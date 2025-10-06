export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: ContentSection[];
  date: string;
  author: string;
  category: string;
  imageUrl?: string;
  keywords?: string[];
  metaDescription?: string;
}

export interface ContentSection {
  type: 'paragraph' | 'heading' | 'subheading' | 'list' | 'quote' | 'table' | 'stats' | 'chart' | 'icon-list' | 'bibliography';
  content?: string;
  items?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  statsData?: {
    value: string;
    label: string;
    icon?: string;
  }[];
  chartData?: {
    title: string;
    data: { name: string; value: number; }[];
  };
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'NUST Sports Complex Achieves Record-Breaking Semester',
    slug: 'nust-sports-complex-record-breaking-semester',
    excerpt: 'NUST University\'s sports facilities have achieved unprecedented success this semester with record participation and outstanding athletic achievements.',
    date: 'December 15, 2024',
    author: 'NUST Sports Department',
    category: 'Sports News',
    imageUrl: '/nust-sports-complex.jpg',
    keywords: [
      'NUST University',
      'sports complex',
      'athletic achievements',
      'student participation',
      'sports management',
      'university sports'
    ],
    metaDescription: 'NUST University sports complex achieves record-breaking semester with increased participation and outstanding athletic achievements.',
    content: [
      {
        type: 'paragraph',
        content: 'The NUST University Sports Complex has experienced an exceptional semester, with participation rates increasing by 40% compared to the previous year. This remarkable growth demonstrates the university\'s commitment to promoting physical fitness and athletic excellence among its student body.'
      },
      {
        type: 'heading',
        content: 'Key Achievements This Semester'
      },
      {
        type: 'list',
        items: [
          'Over 2,500 students actively participating in various sports programs',
          '15 new sports clubs established across different disciplines',
          '95% increase in swimming pool utilization',
          'New state-of-the-art gym equipment installed',
          'Inter-university competitions won in 8 different sports'
        ]
      },
      {
        type: 'subheading',
        content: 'Student Success Stories'
      },
      {
        type: 'paragraph',
        content: 'Several NUST students have achieved national recognition in their respective sports, with 12 students selected for national teams and 3 students winning international competitions.'
      }
    ]
  },
  {
    id: '2',
    title: 'New Swimming Pool Management System Launched at NUST',
    slug: 'swimming-pool-management-system-launched',
    excerpt: 'NUST introduces an advanced swimming pool management system featuring real-time monitoring, automated scheduling, and comprehensive safety protocols.',
    date: 'December 10, 2024',
    author: 'Sportivex Team',
    category: 'Technology',
    imageUrl: '/swimming-pool-management.jpg',
    keywords: [
      'swimming pool management',
      'NUST University',
      'sports technology',
      'pool monitoring',
      'safety protocols',
      'automated scheduling'
    ],
    metaDescription: 'NUST launches advanced swimming pool management system with real-time monitoring and automated scheduling features.',
    content: [
      {
        type: 'paragraph',
        content: 'NUST University has successfully implemented a comprehensive swimming pool management system that revolutionizes how aquatic facilities are operated and maintained. This cutting-edge system ensures optimal safety, efficiency, and user experience.'
      },
      {
        type: 'heading',
        content: 'System Features'
      },
      {
        type: 'list',
        items: [
          'Real-time water quality monitoring',
          'Automated lane assignment and scheduling',
          'Digital attendance tracking',
          'Emergency response protocols',
          'Maintenance scheduling and alerts',
          'User-friendly mobile app integration'
        ]
      },
      {
        type: 'subheading',
        content: 'Benefits for Students and Staff'
      },
      {
        type: 'paragraph',
        content: 'The new system has significantly improved pool utilization efficiency by 35% and reduced maintenance costs by 20%. Students can now easily book swimming sessions through the mobile app, while staff benefit from automated monitoring and reporting features.'
      }
    ]
  },
  {
    id: '3',
    title: 'NUST Gym Facilities Upgrade Complete',
    slug: 'nust-gym-facilities-upgrade-complete',
    excerpt: 'NUST University completes major gym facilities upgrade with new equipment, improved ventilation, and enhanced safety measures for all students.',
    date: 'December 5, 2024',
    author: 'NUST Facilities Management',
    category: 'Facilities',
    imageUrl: '/nust-gym-upgrade.jpg',
    keywords: [
      'NUST gym',
      'facilities upgrade',
      'fitness equipment',
      'student wellness',
      'sports facilities',
      'university infrastructure'
    ],
    metaDescription: 'NUST University completes major gym facilities upgrade with new equipment and enhanced safety measures.',
    content: [
      {
        type: 'paragraph',
        content: 'NUST University has successfully completed a comprehensive upgrade of its gym facilities, introducing state-of-the-art equipment and modern amenities to better serve the fitness needs of its student community.'
      },
      {
        type: 'heading',
        content: 'Upgrade Highlights'
      },
      {
        type: 'list',
        items: [
          '50+ new cardio machines with smart connectivity',
          'Expanded weight training area with premium equipment',
          'Improved ventilation and air conditioning systems',
          'Enhanced lighting and safety features',
          'New functional training zone',
          'Updated locker rooms and shower facilities'
        ]
      },
      {
        type: 'subheading',
        content: 'Student Feedback'
      },
      {
        type: 'paragraph',
        content: 'The upgraded facilities have received overwhelmingly positive feedback from students, with 98% satisfaction rate in recent surveys. The new equipment and improved environment have led to a 60% increase in gym attendance.'
      }
    ]
  },
  {
    id: '4',
    title: 'NUST Badminton Team Wins Inter-University Championship',
    slug: 'nust-badminton-team-wins-championship',
    excerpt: 'NUST University badminton team secures victory in the prestigious Inter-University Badminton Championship, bringing home the trophy for the third consecutive year.',
    date: 'November 28, 2024',
    author: 'NUST Sports Department',
    category: 'Achievements',
    imageUrl: '/nust-badminton-championship.jpg',
    keywords: [
      'NUST badminton',
      'inter-university championship',
      'sports achievement',
      'university competition',
      'badminton team',
      'championship victory'
    ],
    metaDescription: 'NUST University badminton team wins Inter-University Championship for the third consecutive year.',
    content: [
      {
        type: 'paragraph',
        content: 'NUST University\'s badminton team has once again proven their dominance in inter-university competitions by securing victory in the prestigious Inter-University Badminton Championship. This marks their third consecutive championship win, solidifying their position as one of the top badminton programs in the country.'
      },
      {
        type: 'heading',
        content: 'Championship Highlights'
      },
      {
        type: 'list',
        items: [
          'Men\'s singles: Gold medal',
          'Women\'s singles: Gold medal',
          'Men\'s doubles: Silver medal',
          'Women\'s doubles: Gold medal',
          'Mixed doubles: Gold medal',
          'Overall team championship: 1st place'
        ]
      },
      {
        type: 'subheading',
        content: 'Team Performance'
      },
      {
        type: 'paragraph',
        content: 'The team demonstrated exceptional skill and sportsmanship throughout the tournament, winning 15 out of 18 matches played. The victory is a testament to the dedication of both the players and the coaching staff.'
      }
    ]
  },
  {
    id: '5',
    title: 'NUST Sports Management Platform: Digital Transformation Success',
    slug: 'nust-sports-management-platform-success',
    excerpt: 'NUST University\'s digital sports management platform has revolutionized how sports activities are organized, tracked, and managed across the university.',
    date: 'November 20, 2024',
    author: 'Sportivex Team',
    category: 'Technology',
    imageUrl: '/sports-management-platform.jpg',
    keywords: [
      'sports management platform',
      'digital transformation',
      'NUST University',
      'sports technology',
      'university management',
      'digital solutions'
    ],
    metaDescription: 'NUST University\'s digital sports management platform revolutionizes sports activity organization and management.',
    content: [
      {
        type: 'paragraph',
        content: 'NUST University has successfully implemented a comprehensive digital sports management platform that has transformed how sports activities are organized, tracked, and managed across the institution. This digital transformation has resulted in significant improvements in efficiency and user experience.'
      },
      {
        type: 'heading',
        content: 'Platform Features'
      },
      {
        type: 'list',
        items: [
          'Automated facility booking and scheduling',
          'Real-time attendance tracking',
          'Digital payment processing',
          'Comprehensive reporting and analytics',
          'Mobile app for students and staff',
          'Integration with university systems'
        ]
      },
      {
        type: 'subheading',
        content: 'Impact and Results'
      },
      {
        type: 'paragraph',
        content: 'Since the platform\'s implementation, NUST has seen a 45% increase in sports participation, 30% reduction in administrative overhead, and 95% user satisfaction rate. The platform has also enabled better resource allocation and improved facility utilization.'
      }
    ]
  },
  {
    id: '6',
    title: 'NUST Squash Courts Renovation Project Completed',
    slug: 'nust-squash-courts-renovation-completed',
    excerpt: 'NUST University completes renovation of squash courts with modern flooring, improved lighting, and enhanced safety features for optimal playing conditions.',
    date: 'November 15, 2024',
    author: 'NUST Facilities Management',
    category: 'Facilities',
    imageUrl: '/nust-squash-courts.jpg',
    keywords: [
      'NUST squash courts',
      'facility renovation',
      'squash facilities',
      'sports infrastructure',
      'university facilities',
      'court renovation'
    ],
    metaDescription: 'NUST University completes squash courts renovation with modern facilities and enhanced safety features.',
    content: [
      {
        type: 'paragraph',
        content: 'NUST University has successfully completed the renovation of its squash courts, providing students and staff with world-class facilities for squash training and competition. The renovation project focused on improving playing conditions, safety, and overall user experience.'
      },
      {
        type: 'heading',
        content: 'Renovation Details'
      },
      {
        type: 'list',
        items: [
          'New professional-grade flooring installed',
          'Enhanced LED lighting system',
          'Improved ventilation and air circulation',
          'Updated safety barriers and glass panels',
          'New viewing gallery for spectators',
          'Modernized changing rooms and facilities'
        ]
      },
      {
        type: 'subheading',
        content: 'Future Plans'
      },
      {
        type: 'paragraph',
        content: 'With the renovated facilities, NUST plans to host inter-university squash tournaments and establish a comprehensive squash training program for students of all skill levels.'
      }
    ]
  }
];