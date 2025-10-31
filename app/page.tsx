"use client";

import { useEffect, useState } from "react";
import { Button } from "@whop/react/components";

type Todo = {
	id: string;
	text: string;
	done: boolean;
};

const STORAGE_KEY = "whop:todos:v1";

function uid() {
	return Math.random().toString(36).slice(2, 9);
}

export default function Page() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [input, setInput] = useState("");
	const [removing, setRemoving] = useState<Record<string, boolean>>({});

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) setTodos(JSON.parse(raw));
		} catch (e) {
			// ignore
		}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
		} catch (e) {
			// ignore
		}
	}, [todos]);

	function addTodo() {
		const text = input.trim();
		if (!text) return;
		const t: Todo = { id: uid(), text, done: false };
		setTodos((s) => [t, ...s]);
		setInput("");
	}

	function toggleDone(id: string) {
		setTodos((s) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
	}

	function removeTodo(id: string) {
		// add removal animation class, then remove after timeout
		setRemoving((r) => ({ ...r, [id]: true }));
		setTimeout(() => setTodos((s) => s.filter((t) => t.id !== id)), 300);
	}

	return (
			<main className="min-h-screen flex items-center justify-center p-6">
				<div className="w-full max-w-2xl glass-card backdrop-blur-lg rounded-3xl p-6 shadow-xl">
				<header className="mb-6 text-center">
					<h1 className="text-4xl font-extrabold tracking-tight mb-2">Whop Todos</h1>
					<p className="text-sm text-muted-foreground">Simple, fast, and delightful.</p>
				</header>

				<section className="mb-6">
					<div className="flex gap-3">
						<input
							aria-label="Add todo"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && addTodo()}
							className="flex-1 rounded-xl px-4 py-2 shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-accent transition"
							placeholder="Add a new todo..."
						/>
						<Button variant="classic" onClick={addTodo}>Add</Button>
					</div>
				</section>

				<section>
					<ul className="space-y-3">
						{todos.length === 0 && (
							<li className="text-center text-muted-foreground">No todos yet — add one above.</li>
						)}
						{todos.map((t) => (
							<li
								key={t.id}
								className={`todo-item flex items-center justify-between gap-4 p-3 rounded-xl shadow-sm transition-transform duration-300 ease-out ${
									removing[t.id] ? "removing" : ""
								}`}
							>
								<label className="flex items-center gap-3">
									<input
										type="checkbox"
										checked={t.done}
										onChange={() => toggleDone(t.id)}
										className="w-5 h-5 rounded-md"
									/>
									<span className={`select-none ${t.done ? "line-through text-muted-foreground" : ""}`}>
										{t.text}
									</span>
								</label>
								<div className="flex items-center gap-2">
									<button
										aria-label={`Delete ${t.text}`}
										onClick={() => removeTodo(t.id)}
										className="text-sm text-red-500 hover:text-red-600 transition"
									>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				</section>
			</div>
		</main>
	);
}
