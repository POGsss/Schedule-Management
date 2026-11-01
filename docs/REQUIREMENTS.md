I want to develop a system to help my school administration to automate their schedule plotting. Currently they use excel/google docs to handle the plotting of schedule per semester. They have a records of all the classroom available and the number of students per semester and the number of teachers and their workload. So their managing multiple data and those data should be aligned with each other and they do it manually and plotting it making sure that no class schedule will overlap considering the availability of the room, schedule of the student and the schedule and workload of teachers.

Currently it starts with the number of projected student this year they have a record of passing board examinees and based on that they will create a number of sections based on the total of student pass, for example this year they have 300 passers so the first year would have an estimate of 300 students and based on the number of student they will group it into sections. the minimum student per section is 15 and the maximum is 35 now lets say out of 300 student that pass only 280 continue to enroll meaning they will need to split those 280 into 8 sections so that all 8 sections have 35 students (280/35). After that when all the students are defined they will start to look at all the records of the teacher, they will plot the teacher's workload based on their unit for example teacher A has a 30units workload so they will assign all the subjects to accomodate the workload of that teacher now once the teacher has all the subject matching their expertise and the unit of the subject they will now plot that teacher into their schedule but they will also check and make sure that no 2 teacher will have a conflicting schedule. Now the subject plotting and room plotting, every room has a schedule also and not every room can accomodate a subject since for example PE subject cannot be perform in a laboratory room since PE needs an open area or a court so they will also plot the subjects on the rooms and make sure also that no subject overlap to the room schedule and no teacher schedule conflict to the subject plotted to the room. After all of that they will have a fully built teachers schedule based on their load and a designated room per class, class schedule based the student unit subject with teacher and room designation, and a fully plotted room with all the subject that will be taken on that room. All of this shouldnt have a conflict with each other or overlapping schedule.

Now the problem is the school administration do this manually they plot this by hand and adjusting it whenever there is a conflict. This is not efficient and prone to errors and time consuming. What i want to build is an automated plotting system where the school administration will just manage configurable information or constraints and the system will handle all the complicated mapping and plotting of the schedule. Think of the queen problem where given a constraint of the queen movement in chess and the algorithm will plot all the tile a queen can be placed legally without a conflict with each other. Thats what I want to build but this time im not just plotting 1 entity im plotting 3 entity with interconnected with each other and cannot be overlapping. I want you to help me plan for this and suggest what solution I can build out of this problem

INPUT:
• faculty profile
• # of sections
• room restrictions

OUTPUT:
• teaching load
• class schedule
• room plotting

DEFINITIONS:
• faculty profile — dependent on # of units allowed to teach, subjects previously handled, trainings & expertise
• # of sections — dependent on the # of students projected for enrollment
• room restrictions — dependent on the # of available rooms for lecture/laboratory/drawing
• teaching load — schedule of teachers
• class schedule — schedule of students
• room plotting — schedule of rooms

NOTE:
teaching load, class schedule, and room plotting must show the name of the subject and the time allotment

AIM:
automize the creation of teaching loads, class schedules, and room plottings while meeting the requirements set for faculty profile, number of sections, and room restrictions

REFERENCE:
check the files inside the reference folder and see exactly the current mapping they do. The sample showcase different docs file with the sample outputed mapping and the schedule based on the manual plotting
