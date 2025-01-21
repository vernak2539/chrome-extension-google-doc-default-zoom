export const isGoogleClassroomDomain = () => {
  const isGoogleClassroomDomain =
    window.location.hostname === "classroom.google.com";

  return isGoogleClassroomDomain;
};
