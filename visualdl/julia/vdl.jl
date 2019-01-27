module VisualDL
  using CxxWrap
  @wrapmodule(joinpath("visualdl/julia","libvdljl"))

  function __init__()
    @initcxx
  end
end