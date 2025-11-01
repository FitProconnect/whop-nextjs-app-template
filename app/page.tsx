"use client";

import { useState } from "react";
import { Button } from "@whop/react/components";
import useTasks from "../hooks/useTasks";
import TaskSyncIndicator from "../components/TaskSyncIndicator";
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {
		const { tasks, lastSavedAt, addTask, updateTask, deleteTask } = useTasks();
	const [input, setInput] = useState("");
	const [removing, setRemoving] = useState<Record<string, boolean>>({});

	function onAdd() {
		const text = input.trim();
		if (!text) return;
		addTask({ text });
		setInput("");
	}

	// toggle by reading current tasks
		function onToggle(id: string) {
			const t = (tasks as any[]).find((x: any) => x.id === id) as any;
			if (!t) return;
			updateTask(id, { done: !t.done });
		}

	function onDelete(id: string) {
		setRemoving((r) => ({ ...r, [id]: true }));
		setTimeout(() => deleteTask(id), 300);
	}

	return (
		<main className="min-h-screen flex items-center justify-center p-6">
			<div className="w-full max-w-2xl glass-card backdrop-blur-lg rounded-3xl p-6 shadow-xl">
				<header className="mb-6 text-center">
					<h1 className="text-4xl font-extrabold tracking-tight mb-2">Whop Todos</h1>
					<p className="text-sm text-muted-foreground">Simple, fast, and delightful.</p>
					<div className="mt-2">
						<TaskSyncIndicator lastSavedAt={lastSavedAt} />
					</div>
				</header>

				<section className="mb-6">
					<div className="flex gap-3">
						<input
							aria-label="Add todo"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && onAdd()}
							className="flex-1 rounded-xl px-4 py-2 shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-accent transition"
							placeholder="Add a new todo..."
						/>
						<Button variant="classic" onClick={onAdd}>Add</Button>
					</div>
				</section>

						<section>
							<ul className="space-y-3">
								{tasks.length === 0 && (
									<li className="text-center text-muted-foreground">No todos yet — add one above.</li>
								)}
								<AnimatePresence>
									{(tasks as any[]).map((t: any) => (
										<motion.li
											key={t.id}
											layout
											initial={{ opacity: 0, y: -8, scale: 0.995 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: -12, scale: 0.985, height: 0, margin: 0, padding: 0 }}
											transition={{ duration: 0.24 }}
											className={`todo-item flex items-center justify-between gap-4 p-3 rounded-xl shadow-sm`}
										>
											<label className="flex items-center gap-3">
												<input
													type="checkbox"
													checked={t.done}
													onChange={() => onToggle(t.id)}
													className="w-5 h-5 rounded-md"
												/>
												<span className={`select-none ${t.done ? "line-through text-muted-foreground" : ""}`}>
													{t.text}
												</span>
											</label>
											<div className="flex items-center gap-2">
												<motion.button
													whileTap={{ scale: 0.95 }}
													aria-label={`Delete ${t.text}`}
													onClick={() => onDelete(t.id)}
													className="text-sm text-red-500 hover:text-red-600 transition"
												>
													Delete
												</motion.button>
											</div>
										</motion.li>
									))}
								</AnimatePresence>
							</ul>
						</section>
			</div>
		</main>
	);
}
