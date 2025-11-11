// import { supabaseAdmin } from '../config/supabase.js';

// /**
//  * Generate dummy user data for testing
//  * @returns {Array} Array of dummy user objects
//  */
// const generateDummyUsers = () => {
//   const dummyUsers = [
//     {
//       name: 'Ahmad Ali Khan',
//       cms_id: 12345,
//       role: 'student',
//       institution: 'NUST',
//       phone: '+92-300-1234567',
//       date_of_birth: '2000-05-15',
//       address: 'House 123, Street 45, Sector G-8/3, Islamabad',
//       bio: 'Computer Science student passionate about web development and sports.',
//       profile_picture_url: 'https://example.com/ahmad-ali.jpg'
//     },
//     {
//       name: 'Fatima Sheikh',
//       cms_id: 12346,
//       role: 'student',
//       institution: 'NUST',
//       phone: '+92-301-2345678',
//       date_of_birth: '1999-08-22',
//       address: 'Apartment 456, Blue Area, Islamabad',
//       bio: 'Engineering student with interest in mobile app development.',
//       profile_picture_url: 'https://example.com/fatima-sheikh.jpg'
//     },
//     {
//       name: 'Dr. Muhammad Hassan',
//       cms_id: 98765,
//       role: 'faculty',
//       institution: 'NUST',
//       phone: '+92-302-3456789',
//       date_of_birth: '1985-03-10',
//       address: 'House 789, F-8/4, Islamabad',
//       bio: 'Professor of Computer Science with expertise in machine learning.',
//       profile_picture_url: 'https://example.com/dr-hassan.jpg'
//     },
//     {
//       name: 'Sara Ahmed',
//       cms_id: 12347,
//       role: 'alumni',
//       institution: 'NUST',
//       phone: '+92-303-4567890',
//       date_of_birth: '1998-12-05',
//       address: 'Flat 321, DHA Phase 2, Islamabad',
//       bio: 'Software engineer working in tech industry. NUST graduate.',
//       profile_picture_url: 'https://example.com/sara-ahmed.jpg'
//     },
//     {
//       name: 'Usman Malik',
//       cms_id: 12348,
//       role: 'student',
//       institution: 'NUST',
//       phone: '+92-304-5678901',
//       date_of_birth: '2001-07-18',
//       address: 'House 654, E-11/3, Islamabad',
//       bio: 'Electrical Engineering student, active in university sports.',
//       profile_picture_url: 'https://example.com/usman-malik.jpg'
//     }
//   ];

//   return dummyUsers;
// };

// /**
//  * Create dummy users in auth.users table and insert metadata
//  * @returns {Promise<Object>} Result of the operation
//  */
// export const insertDummyData = async () => {
//   try {
//     console.log('🚀 Starting dummy data insertion...');

//     const dummyUsers = generateDummyUsers();
//     const results = [];

//     for (const userData of dummyUsers) {
//       try {
//         // Check if user already exists
//         const { data: existingUser } = await supabaseAdmin
//           .from('users_metadata')
//           .select('cms_id')
//           .eq('cms_id', userData.cms_id)
//           .single();

//         if (existingUser) {
//           console.log(`⚠️  User with CMS ID ${userData.cms_id} already exists, skipping...`);
//           continue;
//         }

//         // Create user in auth.users (this would normally be done through signup)
//         // For demo purposes, we'll just insert into users_metadata table
//         const { data: insertedData, error } = await supabaseAdmin
//           .from('users_metadata')
//           .insert([{
//             name: userData.name,
//             cms_id: userData.cms_id,
//             role: userData.role,
//             institution: userData.institution,
//             phone: userData.phone,
//             date_of_birth: userData.date_of_birth,
//             address: userData.address,
//             bio: userData.bio,
//             profile_picture_url: userData.profile_picture_url,
//             registration_date: new Date().toISOString()
//           }])
//           .select();

//         if (error) {
//           console.error(`❌ Error inserting user ${userData.name}:`, error);
//           results.push({
//             name: userData.name,
//             cms_id: userData.cms_id,
//             success: false,
//             error: error.message
//           });
//         } else {
//           console.log(`✅ Successfully inserted user: ${userData.name} (CMS ID: ${userData.cms_id})`);
//           results.push({
//             name: userData.name,
//             cms_id: userData.cms_id,
//             success: true,
//             data: insertedData[0]
//           });
//         }
//       } catch (userError) {
//         console.error(`❌ Error processing user ${userData.name}:`, userError);
//         results.push({
//           name: userData.name,
//           cms_id: userData.cms_id,
//           success: false,
//           error: userError.message
//         });
//       }
//     }

//     const successCount = results.filter(r => r.success).length;
//     const failureCount = results.filter(r => !r.success).length;

//     console.log(`\n📊 Dummy data insertion completed:`);
//     console.log(`✅ Successful: ${successCount}`);
//     console.log(`❌ Failed: ${failureCount}`);
//     console.log(`📋 Total processed: ${results.length}`);

//     return {
//       success: true,
//       message: `Dummy data insertion completed. ${successCount} users inserted successfully.`,
//       results: results,
//       summary: {
//         total: results.length,
//         successful: successCount,
//         failed: failureCount
//       }
//     };

//   } catch (error) {
//     console.error('❌ Error in dummy data insertion:', error);
//     return {
//       success: false,
//       message: 'Failed to insert dummy data',
//       error: error.message
//     };
//   }
// };

// /**
//  * Clear all dummy data from users_metadata table
//  * @returns {Promise<Object>} Result of the operation
//  */
// export const clearDummyData = async () => {
//   try {
//     console.log('🧹 Clearing dummy data...');

//     // Get all dummy users by CMS IDs
//     const dummyCmsIds = [12345, 12346, 98765, 12347, 12348];
    
//     const { data: deletedData, error } = await supabaseAdmin
//       .from('users_metadata')
//       .delete()
//       .in('cms_id', dummyCmsIds)
//       .select();

//     if (error) {
//       console.error('❌ Error clearing dummy data:', error);
//       return {
//         success: false,
//         message: 'Failed to clear dummy data',
//         error: error.message
//       };
//     }

//     console.log(`✅ Cleared ${deletedData.length} dummy records`);
//     return {
//       success: true,
//       message: `Successfully cleared ${deletedData.length} dummy records`,
//       deletedCount: deletedData.length
//     };

//   } catch (error) {
//     console.error('❌ Error clearing dummy data:', error);
//     return {
//       success: false,
//       message: 'Failed to clear dummy data',
//       error: error.message
//     };
//   }
// };

// /**
//  * Check if dummy data already exists
//  * @returns {Promise<Object>} Result of the check
//  */
// export const checkDummyDataExists = async () => {
//   try {
//     const dummyCmsIds = [12345, 12346, 98765, 12347, 12348];
    
//     const { data, error } = await supabaseAdmin
//       .from('users_metadata')
//       .select('cms_id, name')
//       .in('cms_id', dummyCmsIds);

//     if (error) {
//       return {
//         success: false,
//         message: 'Failed to check dummy data',
//         error: error.message
//       };
//     }

//     return {
//       success: true,
//       exists: data.length > 0,
//       count: data.length,
//       existingUsers: data
//     };

//   } catch (error) {
//     return {
//       success: false,
//       message: 'Failed to check dummy data',
//       error: error.message
//     };
//   }
// };

