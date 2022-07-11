import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	// Connect the client
	await prisma.$connect();
	// ... you will write your Prisma Client queries here

	await prisma.comment.deleteMany();
	await prisma.post.deleteMany();
	await prisma.user.deleteMany();

	const firstUser = await prisma.user.create({
		data: {
			email: "mk@email.com",
			name: "mk",
			posts: {
				create: {
					slug: "first",
					title: "My first post",
					body: "I like writing posts",
				},
			},
			role: "EDITOR",
		},
		select: { email: true, role: true, posts: { select: { title: true } } },
	});

	await prisma.post.update({
		where: {
			slug: "first",
		},
		data: {
			comments: {
				createMany: {
					data: [
						{ comment: "I love this first post" },
						{ comment: "Hey can you elaborate?" },
					],
				},
			},
		},
	});

	await prisma.user.update({
		where: { email: "mk@email.com" },
		data: {
			posts: {
				create: [
					{
						slug: "second",
						title: "my second post",
						body: "I like sharing my trip experiences",
						comments: {
							createMany: {
								data: [
									{ comment: "love trips" },
									{ comment: "can you share some countries to visit?" },
								],
							},
						},
					},
					{
						slug: "third",
						title: "my third post",
						body: "I like sharing my code tips and tricks",
						comments: {
							createMany: {
								data: [
									{ comment: "love coding" },
									{ comment: "can you share some coding languages?" },
									{ comment: "what is your best app?" },
								],
							},
						},
					},
				],
				update: {
					where: {
						slug: "first",
					},
					data: {
						title: "my fist post updated",
					},
				},
			},
		},
	});

	const newUsers = await prisma.user.createMany({
		data: [
			{
				email: "mich@email.com",
				name: "mich",
			},
			{
				email: "johndoe@email.com",
				name: "johndoe",
			},
		],
	});

	// const updatedComments = await prisma.comment.updateMany({
	// 	where: {
	// 		id: {
	// 			in: [
	// 				"62cbd6908c972c7678456cd7",
	// 				"62cbda78535ac090f85e75ec",
	// 				"62cbda78535ac090f85e75f0",
	// 			],
	// 		},
	// 	},
	// 	data: {
	// 		userId: "62cbde4a966ccbe3a33197a4",
	// 	},
	// });

	const allUsers = await prisma.user.findMany({
		include: {
			posts: { select: { title: true, comments: true } },
			comments: true,
		},
	});

	const allPosts = await prisma.post.findMany({
		include: {
			comments: true,
		},
	});

	console.log("*".repeat(100));
	console.log("%c ***List of Users****", "background: #222; color: #bada55");
	console.dir(allUsers, { depth: null });

	console.log("*".repeat(100));
	console.log("%c ***List of Posts****", "background: #222; color: #bada55");
	console.dir(allPosts, { depth: null, colors: true });
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
