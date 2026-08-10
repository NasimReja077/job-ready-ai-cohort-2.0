const UserCard = ({ user }) => {
  console.log("Rendering:", user.name);

  return (
    <div className="rounded-xl border p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="h-14 w-14 rounded-full"
        />

        <div>
          <h2 className="font-bold">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
