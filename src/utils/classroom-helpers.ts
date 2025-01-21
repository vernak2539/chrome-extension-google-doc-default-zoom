export const isGoogleClassroomDomain = () => {
  const isGoogleClassroomDomain =
    window.location.hostname === "classroom.google.com";

  return isGoogleClassroomDomain;
};

export const isGoogleClassroomSubmittedAssignment = () => {
  const url = window.location.href;
  // const allowedApps = ["Docs", "Sheets"];
  // const currentApp = getCurrentApp(url);

  // if (!allowedApps.includes(currentApp)) {
  //   return false;
  // }

  // This is a kind of URL loaded from a submitted assignment that is loaded in an iframe
  // https://docs.google.com/document/d/1SdKXcvnUYO_SBhFl-zG1CJ01gFdO0KntJMy_rPghE3c/grading?allow_parent=https://classroom.google.com&enable_comments=true&tab=t.0
  const { pathname } = new URL(url);
  return pathname.endsWith("/grading");

  return true;
};
