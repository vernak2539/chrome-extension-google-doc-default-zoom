import { GOOGLE_CLASSROOM_DOMAIN } from "src/constants";

export const isGoogleClassroomDomain = () => {
  return window.location.hostname === GOOGLE_CLASSROOM_DOMAIN;
};

export const isGoogleClassroomSubmittedAssignment = () => {
  // This is a kind of URL loaded from a submitted assignment that is loaded in an iframe
  // https://docs.google.com/document/d/1SdKXcvnUYO_SBhFl-zG1CJ01gFdO0KntJMy_rPghE3c/grading?allow_parent=https://classroom.google.com&enable_comments=true&tab=t.0
  const { pathname } = new URL(window.location.href);
  return pathname.endsWith("/grading");
};
