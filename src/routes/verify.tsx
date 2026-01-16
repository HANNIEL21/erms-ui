import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/verify')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <div>
                <h1>Certificate Print Status</h1>
            </div>
            <div></div>
        </div>
    )
}
