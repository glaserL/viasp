
module ViaspDash
using Dash

const resources_path = realpath(joinpath( @__DIR__, "..", "deps"))
const version = "0.0.1"

include("viasp_viaspdash.jl")

function __init__()
    DashBase.register_package(
        DashBase.ResourcePkg(
            "viasp_dash",
            resources_path,
            version = version,
            [
                DashBase.Resource(
    relative_package_path = "viasp_dash.min.js",
    external_url = nothing,
    dynamic = nothing,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "viasp_dash.min.js.map",
    external_url = nothing,
    dynamic = true,
    async = nothing,
    type = :js
)
            ]
        )

    )
end
end
