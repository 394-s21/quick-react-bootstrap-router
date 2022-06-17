
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { signInWithGoogleRedirect, signOut, useData, useUserState } from './firebase';
import EditForm from './EditForm';
import './App.css';
import { timeParts } from './times';

const Banner = ({ title }) => (
  <h1>
    { title }
  </h1>
);

const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};

const getCourseTerm = course => (
  terms[course.id.charAt(0)]
);

const getCourseNumber = course => (
  course.id.slice(1, 4)
);

const days = ['M', 'Tu', 'W', 'Th', 'F'];

const daysOverlap = (days1, days2) => ( 
  days.some(day => days1.includes(day) && days2.includes(day))
);

const hoursOverlap = (hours1, hours2) => (
  Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end)
);

const timeConflict = (course1, course2) => (
  daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
);

const courseConflict = (course1, course2) => (
  course1 !== course2
  && getCourseTerm(course1) === getCourseTerm(course2)
  && timeConflict(course1, course2)
);

const hasConflict = (course, selected) => (
  !selected.includes(course)
  && selected.some(selection => courseConflict(course, selection))
);

const mapValues = (fn, obj) => (
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value)]))
);

const addCourseTimes = course => ({
  ...course,
  ...timeParts(course.meets)
});

const addScheduleTimes = schedule => ({
  title: schedule.title,
  courses: mapValues(addCourseTimes, schedule.courses)
});

const toggle = (x, lst) => (
  lst.includes(x) ? lst.filter(y => y !== x) : [x, ...lst]
);

const Course = ({ course, selected, setSelected }) => {
  const navigate = useNavigate();
  const isSelected = selected.includes(course);
  const isDisabled = hasConflict(course, selected);
  const [user] = useUserState();
  const style = {
    backgroundColor: isDisabled? 'lightgrey' : isSelected ? 'lightgreen' : 'white'
  };
  
  return (
    <div className="card m-1 p-2"
        data-cy="course"
        style={style}
        onClick={(isDisabled) ? null : () => setSelected(toggle(course, selected))}
        onDoubleClick={!user ? null : () => navigate('/edit', { state: course })}>
      <div className="card-body">
        <div className="card-title">{ getCourseTerm(course) } CS { getCourseNumber(course) }</div>
        <div className="card-text">{ course.title }</div>
        <div className="card-text">{ course.meets }</div>
      </div>
    </div>
  );
};

const SignInButton = () => (
  <button className="btn btn-secondary btn-sm" onClick={() => signInWithGoogleRedirect()}>
    Sign In
  </button>
);

const SignOutButton = () => (
  <button className="btn btn-secondary btn-sm" onClick={() => signOut()}>
    Sign Out
  </button>
);

const TermButton = ({term, setTerm, checked}) => (
  <>
    <input type="radio" id={term} className="btn-check" checked={checked} autoComplete="off"
      onChange={() => setTerm(term)} />
    <label className="btn btn-success m-1 p-2" htmlFor={term} data-cy={term} >
    { term }
    </label>
  </>
);

const TermSelector = ({term, setTerm}) => {
  const [user] = useUserState();
  console.log(`user ${user}`);
  
  return (
    <div className="btn-toolbar justify-content-between">
      <div className="btn-group">
      { 
        Object.values(terms).map(
          value => <TermButton key={value} term={value} setTerm={setTerm} checked={value === term} />
        )
      }
      </div>
      { user ? <SignOutButton /> : <SignInButton /> }
    </div>
  );
};

const scheduleChanged = (selected, courses) => (
  selected.some(course => course !== courses[course.id])
);

const CourseList = ({ courses }) => {
  const [term, setTerm] = useState('Fall');
  const [selected, setSelected] = useState([]);
  if (scheduleChanged(selected, courses)) {
    console.log('schedule changed');
    setSelected([])
  };
  const termCourses = Object.values(courses).filter(course => term === getCourseTerm(course));
  
  return (
    <>
      <TermSelector term={term} setTerm={setTerm} />
      <div className="course-list">
      { 
        termCourses.map(course =>
          <Course key={ course.id } course={ course }
            selected={selected} setSelected={ setSelected } 
          />) 
      }
      </div>
    </>
  );
};

const Main = () => {
  // const url = 'https://courses.cs.northwestern.edu/394/data/cs-courses.php';
  // const [schedule, loading, error] = useFileData(url, addScheduleTimes);
  const [schedule, loading, error] = useData('/schedule', addScheduleTimes); 
  
  if (error) return <h1>{error}</h1>;
  if (loading) return <h1>Loading the schedule...</h1>

  return (
    <div className="container">
      <Banner title={ schedule.title } />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CourseList courses={ schedule.courses } />} />
          <Route path="/edit" element={ <EditForm courses={ schedule.courses } /> } />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <Main />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
);

export default App;