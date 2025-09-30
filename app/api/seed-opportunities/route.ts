import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectToDatabase();

    // First, create some dummy users if they don't exist
    const dummyUsers = [
      {
        email: 'hr@techstart.com',
        password: await bcrypt.hash('dummy123', 10),
        fullName: 'HR Manager',
        username: 'techstart_hr',
        collegeIdUrl: 'dummy-url',
        verified: true,
        mobile: '9876543210',
        collegeName: 'TechStart Solutions'
      },
      {
        email: 'careers@innovatelabs.com',
        password: await bcrypt.hash('dummy123', 10),
        fullName: 'Career Team',
        username: 'innovate_careers',
        collegeIdUrl: 'dummy-url',
        verified: true,
        mobile: '9876543211',
        collegeName: 'InnovateLabs'
      },
      {
        email: 'mentors@mentorconnect.com',
        password: await bcrypt.hash('dummy123', 10),
        fullName: 'Mentor Connect',
        username: 'mentor_connect',
        collegeIdUrl: 'dummy-url',
        verified: true,
        mobile: '9876543212',
        collegeName: 'MentorConnect'
      }
    ];

    // Create users if they don't exist
    const createdUsers = [];
    for (const userData of dummyUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
      }
      createdUsers.push(user);
    }

    // Clear existing opportunities from these dummy users
    await Opportunity.deleteMany({
      userId: { $in: createdUsers.map(u => u._id) }
    });

    // Create dummy opportunities
    const dummyOpportunities = [
      // Jobs
      {
        title: 'Full Stack Developer',
        company: 'TechStart Solutions',
        type: 'job',
        location: 'Bengaluru, Karnataka',
        duration: 'Full-time',
        salary: '₹8-12 LPA',
        description: 'Join our dynamic team to build scalable web applications using MERN stack. Work on cutting-edge projects with modern technologies and grow your career in a supportive environment.',
        requirements: ['Node.js', 'React.js', 'MongoDB', 'Express.js', '2+ years experience', 'JavaScript', 'Git'],
        tags: ['Full-time', 'Benefits', 'Growth', 'Remote Options'],
        featured: true,
        deadline: new Date('2024-03-15'),
        contactEmail: 'hr@techstart.com',
        contactPhone: '+91-9876543210',
        userId: createdUsers[0]._id,
        active: true
      },
      {
        title: 'Senior React Developer',
        company: 'InnovateLabs',
        type: 'job',
        location: 'Mumbai, Maharashtra',
        duration: 'Full-time',
        salary: '₹15-20 LPA',
        description: 'Lead frontend development for our flagship products. Mentor junior developers and architect scalable React applications used by millions of users.',
        requirements: ['React.js', 'TypeScript', '5+ years experience', 'Leadership skills', 'Next.js', 'Redux'],
        tags: ['Senior Level', 'Leadership', 'High Salary', 'Stock Options'],
        featured: true,
        deadline: new Date('2024-02-28'),
        contactEmail: 'careers@innovatelabs.com',
        contactPhone: '+91-9876543211',
        userId: createdUsers[1]._id,
        active: true
      },
      {
        title: 'Backend Developer - Python',
        company: 'DataFlow Systems',
        type: 'job',
        location: 'Hyderabad, Telangana',
        duration: 'Full-time',
        salary: '₹10-14 LPA',
        description: 'Build robust backend systems using Python and Django. Work with big data processing and API development for fintech applications.',
        requirements: ['Python', 'Django', 'PostgreSQL', 'Redis', 'AWS', '3+ years experience'],
        tags: ['Backend', 'Fintech', 'Big Data', 'Cloud'],
        featured: false,
        deadline: new Date('2024-03-01'),
        contactEmail: 'jobs@dataflow.com',
        userId: createdUsers[0]._id,
        active: true
      },
      {
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        type: 'job',
        location: 'Pune, Maharashtra',
        duration: 'Full-time',
        salary: '₹12-18 LPA',
        description: 'Manage cloud infrastructure and CI/CD pipelines. Ensure high availability and scalability of our microservices architecture.',
        requirements: ['Docker', 'Kubernetes', 'AWS/Azure', 'Jenkins', 'Terraform', '4+ years experience'],
        tags: ['DevOps', 'Cloud', 'Microservices', 'Infrastructure'],
        featured: false,
        deadline: new Date('2024-03-10'),
        contactEmail: 'devops@cloudtech.com',
        userId: createdUsers[1]._id,
        active: true
      },
      {
        title: 'Data Scientist',
        company: 'AI Innovations',
        type: 'job',
        location: 'Delhi, Delhi',
        duration: 'Full-time',
        salary: '₹16-22 LPA',
        description: 'Lead data science initiatives and build ML models for predictive analytics. Work with large datasets and cutting-edge AI technologies.',
        requirements: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'PhD/Masters preferred'],
        tags: ['Data Science', 'AI/ML', 'Research', 'High Growth'],
        featured: true,
        deadline: new Date('2024-02-25'),
        contactEmail: 'careers@aiinnovations.com',
        userId: createdUsers[2]._id,
        active: true
      },

      // Internships
      {
        title: 'Frontend Developer Intern',
        company: 'TechStart Solutions',
        type: 'internship',
        location: 'Remote / Gurgaon',
        duration: '3-6 months',
        salary: '₹15,000/month',
        description: 'Work on cutting-edge React applications and gain hands-on experience with modern web technologies. Perfect opportunity for students to learn and grow.',
        requirements: ['React.js', 'JavaScript', 'HTML/CSS', 'Git', 'Currently pursuing CS/IT'],
        tags: ['Remote', 'Flexible', 'Learning', 'Certificate'],
        featured: true,
        deadline: new Date('2024-02-20'),
        contactEmail: 'internships@techstart.com',
        contactPhone: '+91-9876543210',
        userId: createdUsers[0]._id,
        active: true
      },
      {
        title: 'Backend Development Intern',
        company: 'InnovateLabs',
        type: 'internship',
        location: 'Bengaluru, Karnataka',
        duration: '4-6 months',
        salary: '₹18,000/month',
        description: 'Learn backend development with Node.js and databases. Work on real projects and get mentorship from senior developers.',
        requirements: ['Node.js basics', 'Database knowledge', 'Problem solving', 'Engineering student'],
        tags: ['Mentorship', 'Real Projects', 'Certificate', 'Full-time offer potential'],
        featured: false,
        deadline: new Date('2024-03-05'),
        contactEmail: 'internships@innovatelabs.com',
        userId: createdUsers[1]._id,
        active: true
      },
      {
        title: 'UI/UX Design Intern',
        company: 'DesignCraft Studio',
        type: 'internship',
        location: 'Mumbai, Maharashtra',
        duration: '3 months',
        salary: '₹12,000/month',
        description: 'Create stunning user interfaces and experiences for mobile and web applications. Learn from industry experts and build your portfolio.',
        requirements: ['Figma', 'Adobe Creative Suite', 'Portfolio', 'Design thinking', 'Communication skills'],
        tags: ['Design', 'Portfolio Building', 'Creative', 'Client Projects'],
        featured: false,
        deadline: new Date('2024-02-28'),
        contactEmail: 'design@designcraft.com',
        userId: createdUsers[2]._id,
        active: true
      },
      {
        title: 'Data Analytics Intern',
        company: 'DataInsights Corp',
        type: 'internship',
        location: 'Hyderabad, Telangana',
        duration: '6 months',
        salary: '₹20,000/month',
        description: 'Analyze large datasets and create insights for business decisions. Learn Python, SQL, and data visualization tools.',
        requirements: ['Python basics', 'SQL', 'Excel', 'Statistics knowledge', 'Final year student'],
        tags: ['Data Analysis', 'Python', 'Business Intelligence', 'High Stipend'],
        featured: true,
        deadline: new Date('2024-03-15'),
        contactEmail: 'internships@datainsights.com',
        userId: createdUsers[0]._id,
        active: true
      },
      {
        title: 'Mobile App Development Intern',
        company: 'AppGenius Solutions',
        type: 'internship',
        location: 'Chennai, Tamil Nadu',
        duration: '4 months',
        salary: '₹16,000/month',
        description: 'Build mobile applications using React Native or Flutter. Work on apps used by thousands of users and learn mobile development best practices.',
        requirements: ['React Native/Flutter', 'JavaScript/Dart', 'Mobile UI/UX', 'API integration'],
        tags: ['Mobile Development', 'Cross-platform', 'User Base', 'Modern Tech'],
        featured: false,
        deadline: new Date('2024-03-08'),
        contactEmail: 'mobile@appgenius.com',
        userId: createdUsers[1]._id,
        active: true
      },

      // Some Mentorship and Coaching opportunities
      {
        title: 'Career Mentorship Program',
        company: 'MentorConnect',
        type: 'mentor',
        location: 'Online',
        duration: '3 months',
        salary: 'Free',
        description: 'Get personalized guidance from industry experts to accelerate your career growth. One-on-one sessions with experienced professionals.',
        requirements: ['Open to all students', 'Commitment to 2 hours/week', 'Goal-oriented mindset'],
        tags: ['Free', 'Personalized', 'Growth', 'Industry Experts'],
        featured: false,
        deadline: new Date('2024-04-01'),
        contactEmail: 'mentors@mentorconnect.com',
        userId: createdUsers[2]._id,
        active: true
      },
      {
        title: 'Full Stack Web Development Bootcamp',
        company: 'CodeLearn Academy',
        type: 'coaching',
        location: 'Hybrid (Online + Delhi)',
        duration: '6 months',
        salary: '₹65,000 (EMI available)',
        description: 'Comprehensive full-stack development program with hands-on projects and job placement assistance. Learn MERN stack from industry experts.',
        requirements: ['Basic programming knowledge', 'Laptop/Computer', 'Commitment to learn'],
        tags: ['Certification', 'Job Assistance', 'Hands-on', 'Industry Ready'],
        featured: true,
        deadline: new Date('2024-02-22'),
        contactEmail: 'admissions@codelearn.com',
        contactPhone: '+91-9123456789',
        userId: createdUsers[0]._id,
        active: true
      }
    ];

    // Insert all opportunities
    const createdOpportunities = await Opportunity.insertMany(dummyOpportunities);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdOpportunities.length} opportunities and ${createdUsers.length} users`,
      data: {
        opportunities: createdOpportunities.length,
        users: createdUsers.length
      }
    });

  } catch (error) {
    console.error('Error seeding opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to seed opportunities' },
      { status: 500 }
    );
  }
}