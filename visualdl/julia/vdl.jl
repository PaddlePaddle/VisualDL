module VisualDL
  using CxxWrap
  @wrapmodule(joinpath("visualdl/julia","libvdljl"))

  function __init__()
    @initcxx
  end
end

using .VisualDL

logger = VisualDL.LogWriter("./tmp", 10000)
VisualDL.setmode(logger, "train")
tablet = VisualDL.addtablet(logger, "scalars/scalar0")
scalar0 = VisualDL.Scalar{Float32}(tablet)

for step in 1:1000
    VisualDL.addrecord(scalar0, step, rand(Float32))
end
VisualDL.save(logger)