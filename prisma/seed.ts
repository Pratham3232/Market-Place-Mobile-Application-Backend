import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');
  
  try {
    // Clear existing data (optional - remove if you don't want to clear)
    console.log('Clearing existing data...');
    await prisma.activity.deleteMany({});
    await prisma.serviceCategory.deleteMany({});
    
    console.log('Seeding ServiceCategory and Activity tables...');
    
    // Define the categories and their activities
    const categoriesData = [
      {
        categoryName: 'Academics & Tutoring',
        activities: [
          'Arithmetic tutoring',
          'Pre-algebra tutoring',
          'Algebra I tutoring',
          'Algebra II tutoring',
          'Geometry tutoring',
          'Trigonometry tutoring',
          'Precalculus tutoring',
          'Calculus tutoring',
          'Statistics tutoring',
          'General science tutoring',
          'Biology tutoring',
          'Chemistry tutoring',
          'Physics tutoring',
          'Environmental science tutoring',
          'Earth science tutoring',
          'Reading tutoring',
          'Phonics tutoring',
          'Writing coaching',
          'Grammar tutoring',
          'Literature tutoring',
          'ELA test prep tutoring',
          'World history tutoring',
          'U.S. history tutoring',
          'Civics tutoring',
          'Geography tutoring',
          'Economics tutoring',
          'Homework help session',
          'SAT prep tutoring',
          'ACT prep tutoring',
          'AP exam prep tutoring (specify subject)'
        ]
      },
      {
        categoryName: 'Music & Performing Arts',
        activities: [
          'Piano lesson',
          'Guitar lesson',
          'Violin lesson',
          'Cello lesson',
          'Flute lesson',
          'Saxophone lesson',
          'Trumpet lesson',
          'Drum lesson',
          'Vocal coaching session',
          'Choir preparation session',
          'Theater coaching',
          'Ballet lesson',
          'Hip-hop dance lesson',
          'Jazz dance lesson',
          'Tap dance lesson',
          'Contemporary dance lesson',
          'Music theory lesson',
          'Songwriting coaching',
          'Music production coaching',
          'DJ lesson'
        ]
      },
      {
        categoryName: 'Sports & Fitness',
        activities: [
          'Soccer coaching session',
          'Basketball coaching session',
          'Baseball coaching session',
          'Softball coaching session',
          'Volleyball coaching session',
          'Football coaching session',
          'Lacrosse coaching session',
          'Tennis lesson',
          'Swimming lesson',
          'Track-and-field coaching',
          'Gymnastics coaching',
          'Wrestling coaching',
          'Golf lesson',
          'Karate instruction',
          'Taekwondo instruction',
          'Judo instruction',
          'Brazilian jiu-jitsu instruction',
          'Kickboxing instruction',
          'Youth fitness training session',
          'Strength training session',
          'Boxing instruction',
          'Yoga for kids class',
          'Skateboarding lesson',
          'Rock climbing session'
        ]
      },
      {
        categoryName: 'Child Care & Development',
        activities: [
          'Babysitting session',
          'Nanny care session',
          'Early childhood enrichment session',
          'After-school care session',
          'Special needs support session',
          'Developmental play session',
          'Social skills coaching for kids'
        ]
      },
      {
        categoryName: 'Creative Arts & Media',
        activities: [
          'Drawing lesson',
          'Painting lesson',
          'Sculpture lesson',
          'Digital art lesson',
          'Fashion design lesson',
          'Jewelry making lesson',
          'Woodcraft lesson',
          'Photography lesson',
          'Videography lesson',
          'Creative writing coaching',
          'Storytelling coaching',
          'Film basics lesson',
          'Animation basics lesson'
        ]
      },
      {
        categoryName: 'STEM & Technology',
        activities: [
          'Scratch coding lesson',
          'Python coding lesson',
          'Java coding lesson',
          'Web development lesson',
          'Roblox Studio game design lesson',
          'Unity game design lesson',
          'Robotics lesson',
          'Engineering fundamentals lesson',
          '3D printing lesson',
          'CAD design lesson',
          'Electronics basics lesson',
          'Circuit building lesson',
          'Science fair coaching session',
          'Math Olympiad coaching session',
          'Robotics competition coaching session'
        ]
      },
      {
        categoryName: 'Languages & Culture',
        activities: [
          'Spanish lesson',
          'French lesson',
          'Mandarin lesson',
          'Hindi lesson',
          'Arabic lesson',
          'German lesson',
          'American Sign Language lesson',
          'ESL tutoring session',
          'Heritage language support session',
          'Cultural studies session'
        ]
      },
      {
        categoryName: 'Life Skills & Leadership',
        activities: [
          'Public speaking coaching',
          'Debate coaching',
          'Model UN coaching',
          'Leadership coaching',
          'Time management coaching',
          'Study skills coaching',
          'Financial literacy lesson',
          'Cooking lesson',
          'Nutrition coaching',
          'College essay coaching',
          'College application coaching',
          'Interview preparation coaching',
          'Career exploration coaching'
        ]
      },
      {
        categoryName: 'Health, Wellness & Support',
        activities: [
          'Mentorship session',
          'Peer coaching session',
          'Mindfulness session',
          'Meditation session',
          'Occupational therapy session (credentialed)',
          'Speech therapy session (credentialed)',
          'Social-emotional learning coaching',
          'Executive function coaching'
        ]
      },
      {
        categoryName: 'Special Programs & Experiences',
        activities: [
          'Scouting program session',
          'Day camp session',
          'Specialty camp session',
          'Volunteer project mentoring session',
          'Community service coaching',
          'Cultural exchange mentoring session'
        ]
      }
    ];

    // Use a transaction with extended timeout to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Create ServiceCategories and their Activities
      for (const categoryData of categoriesData) {
        console.log(`Creating category: ${categoryData.categoryName}`);
        
        // Create the ServiceCategory
        const category = await tx.serviceCategory.create({
          data: {
            categoryName: categoryData.categoryName,
          },
        });

        // Create Activities for this category using createMany for better performance
        console.log(`Creating ${categoryData.activities.length} activities for ${categoryData.categoryName}`);
        
        await tx.activity.createMany({
          data: categoryData.activities.map(activityName => ({
            name: activityName,
            serviceCategoryId: category.id,
          })),
        });
      }
    }, {
      timeout: 60000, // 60 seconds timeout
    });
    
    console.log('Seed process completed successfully!');
  } catch (error) {
    console.error('Error during seed process:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });